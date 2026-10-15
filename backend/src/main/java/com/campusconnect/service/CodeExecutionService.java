package com.campusconnect.service;

import com.campusconnect.dto.CodeExecutionRequest;
import com.campusconnect.dto.CodeExecutionResponse;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.RateLimitException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Executes student source code in a tightly limited local child process.
 *
 * <p><strong>Security model (local best-effort sandbox):</strong></p>
 * <ul>
 *   <li>Every run executes in a fresh temporary working directory that is deleted afterwards.</li>
 *   <li>Hard wall-clock timeouts for compilation and execution; processes are forcibly destroyed.</li>
 *   <li>Output size is capped to prevent memory exhaustion.</li>
 *   <li>Source size and standard-input size are validated before execution.</li>
 *   <li>Concurrency is bounded by a semaphore; per-user rate limiting prevents flooding.</li>
 *   <li>Only toolchains detected on the host are advertised and executed.</li>
 * </ul>
 *
 * <p><strong>Production note:</strong> a local child process cannot fully isolate network
 * access or filesystem access at the OS level. For production deployments, point this
 * service at an external sandboxed execution service (for example Judge0 or a
 * Docker/gVisor-based runner) with strict seccomp, network, and filesystem restrictions.
 * No credentials are stored in or exposed to the frontend.</p>
 */
@Service
public class CodeExecutionService {

    private static final Logger log = LoggerFactory.getLogger(CodeExecutionService.class);

    private static final long COMPILE_TIMEOUT_MS = 10_000;
    private static final long RUN_TIMEOUT_MS = 5_000;
    private static final int MAX_OUTPUT_BYTES = 64 * 1024;
    private static final int MAX_CONCURRENT_RUNS = 4;
    private static final long USER_COOLDOWN_MS = 1_000;

    /** Display name -> runtime command candidates, in preference order. */
    private static final Map<String, List<String>> RUNTIME_CANDIDATES = new LinkedHashMap<>();
    static {
        RUNTIME_CANDIDATES.put("Python", List.of("python3", "python", "py"));
        RUNTIME_CANDIDATES.put("JavaScript", List.of("node"));
        RUNTIME_CANDIDATES.put("Java", List.of("javac", "java"));
        RUNTIME_CANDIDATES.put("C", List.of("gcc"));
        RUNTIME_CANDIDATES.put("C++", List.of("g++"));
    }

    private static final Map<String, String> EXTENSIONS = Map.of(
            "Python", ".py",
            "JavaScript", ".js",
            "Java", ".java",
            "C", ".c",
            "C++", ".cpp"
    );

    private final Semaphore concurrencySlots = new Semaphore(MAX_CONCURRENT_RUNS);
    private final Map<String, Long> lastRunByUser = new ConcurrentHashMap<>();
    private final ExecutorService streamReaderPool = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r, "code-exec-stream-reader");
        t.setDaemon(true);
        return t;
    });

    /** Display names of languages whose toolchain is actually present on this host. */
    private volatile List<String> availableLanguages = List.of();

    @PostConstruct
    void detectToolchains() {
        List<String> available = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : RUNTIME_CANDIDATES.entrySet()) {
            String language = entry.getKey();
            boolean found;
            if ("Java".equals(language)) {
                found = isCommandAvailable("javac", "-version") && isCommandAvailable("java", "-version");
            } else {
                found = false;
                for (String candidate : entry.getValue()) {
                    if (isCommandAvailable(candidate, "--version")) {
                        found = true;
                        break;
                    }
                }
            }
            if (found) {
                available.add(language);
            }
        }
        availableLanguages = List.copyOf(available);
        log.info("Code execution toolchains detected: {}", available);
    }

    public List<String> getSupportedLanguages() {
        return availableLanguages;
    }

    /**
     * Validates and executes a submitted program. See class javadoc for the security model.
     */
    public CodeExecutionResponse executeCode(String username, CodeExecutionRequest request) {
        String language = request.getProgrammingLanguage() == null
                ? "" : request.getProgrammingLanguage().trim();
        String sourceCode = request.getSourceCode() == null ? "" : request.getSourceCode();
        String standardInput = request.getStandardInput() == null ? "" : request.getStandardInput();

        if (!availableLanguages.contains(language)) {
            throw new BadRequestException(
                    "Programming language is not supported by this execution service: " + language);
        }
        if (sourceCode.isBlank()) {
            throw new BadRequestException("sourceCode must not be empty");
        }
        if (standardInput.length() > 10_000) {
            throw new BadRequestException("standardInput must be at most 10000 characters");
        }

        enforceRateLimit(username);

        boolean acquired;
        try {
            acquired = concurrencySlots.tryAcquire(2, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RateLimitException("Execution was interrupted; please try again");
        }
        if (!acquired) {
            throw new RateLimitException("Too many concurrent execution requests; please try again in a moment");
        }
        try {
            return runInTempWorkspace(language, sourceCode, standardInput);
        } finally {
            concurrencySlots.release();
        }
    }

    // ------------------------------------------------------------------
    // Execution pipeline
    // ------------------------------------------------------------------

    private CodeExecutionResponse runInTempWorkspace(String language, String sourceCode, String standardInput) {
        long startedAt = System.nanoTime();
        try {
            PathHolder workspace = createWorkspace();
            try {
                CodeExecutionResponse response;
                if ("Java".equals(language)) {
                    response = executeJava(workspace, sourceCode, standardInput);
                } else if ("C".equals(language) || "C++".equals(language)) {
                    response = executeCompiledNative(workspace, language, sourceCode, standardInput);
                } else {
                    response = executeScript(language, workspace, sourceCode, standardInput);
                }
                long elapsedMs = (System.nanoTime() - startedAt) / 1_000_000;
                response.setExecutionTime(elapsedMs + " ms");
                return response;
            } finally {
                deleteRecursively(workspace.dir);
            }
        } catch (IOException e) {
            log.error("Failed to prepare execution workspace", e);
            return failure("Could not prepare the execution environment. Please try again later.");
        }
    }

    private CodeExecutionResponse executeScript(String language, PathHolder workspace,
                                                String sourceCode, String standardInput) throws IOException {
        String executable = firstAvailableCommand(language);
        String fileName = ("Python".equals(language)) ? "main.py" : "main.js";
        File sourceFile = new File(workspace.dir, fileName);
        Files.write(sourceFile.toPath(), sourceCode.getBytes(StandardCharsets.UTF_8));

        List<String> command = new ArrayList<>();
        command.add(executable);
        if ("Python".equals(language) && "py".equals(executable)) {
            command.add("-3");
        }
        command.add(sourceFile.getAbsolutePath());
        return runProcess(command, workspace.dir, standardInput, RUN_TIMEOUT_MS, null);
    }

    private CodeExecutionResponse executeJava(PathHolder workspace, String sourceCode,
                                              String standardInput) throws IOException {
        String className = extractJavaClassName(sourceCode);
        File sourceFile = new File(workspace.dir, className + ".java");
        Files.write(sourceFile.toPath(), sourceCode.getBytes(StandardCharsets.UTF_8));

        List<String> compileCommand = List.of(
                "javac", "-encoding", "UTF-8", sourceFile.getAbsolutePath());
        CodeExecutionResponse compile = runProcess(
                compileCommand, workspace.dir, "", COMPILE_TIMEOUT_MS, "compile");
        if (!compile.isCompilationSuccessful()) {
            return compile;
        }

        List<String> runCommand = List.of(
                "java", "-Xmx256m", "-Xss1m", "-cp", workspace.dir.getAbsolutePath(), className);
        return runProcess(runCommand, workspace.dir, standardInput, RUN_TIMEOUT_MS, "run");
    }

    private CodeExecutionResponse executeCompiledNative(PathHolder workspace, String language,
                                                        String sourceCode, String standardInput) throws IOException {
        String compiler = "C".equals(language) ? "gcc" : "g++";
        String fileName = "C".equals(language) ? "main.c" : "main.cpp";
        File sourceFile = new File(workspace.dir, fileName);
        Files.write(sourceFile.toPath(), sourceCode.getBytes(StandardCharsets.UTF_8));
        File binary = new File(workspace.dir, "program.exe");

        List<String> compileCommand = new ArrayList<>();
        compileCommand.add(compiler);
        if ("C++".equals(language)) {
            compileCommand.add("-std=c++17");
        }
        compileCommand.add("-O2");
        compileCommand.add(sourceFile.getAbsolutePath());
        compileCommand.add("-o");
        compileCommand.add(binary.getAbsolutePath());
        CodeExecutionResponse compile = runProcess(
                compileCommand, workspace.dir, "", COMPILE_TIMEOUT_MS, "compile");
        if (!compile.isCompilationSuccessful()) {
            return compile;
        }
        return runProcess(List.of(binary.getAbsolutePath()), workspace.dir,
                standardInput, RUN_TIMEOUT_MS, "run");
    }

    // ------------------------------------------------------------------
    // Process handling
    // ------------------------------------------------------------------

    /**
     * Runs a single child process with bounded runtime and capped output.
     * Stdin is written up front and closed so programs that read to EOF terminate.
     */
    private CodeExecutionResponse runProcess(List<String> command, File workingDir, String standardInput,
                                             long timeoutMs, String phase) {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(workingDir);
        builder.redirectErrorStream(false);

        Process process;
        try {
            process = builder.start();
        } catch (IOException e) {
            return failure("Failed to start the execution process: " + safeMessage(e));
        }

        // Feed stdin on a worker thread so a full pipe can never deadlock the run.
        Future<?> stdinWriter = streamReaderPool.submit(() -> {
            try (OutputStream os = process.getOutputStream()) {
                if (standardInput != null && !standardInput.isEmpty()) {
                    os.write(standardInput.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }
            } catch (IOException ignored) {
                // Process exited before consuming stdin; not an error for us.
            }
            return null;
        });

        java.util.concurrent.Callable<byte[]> readStdout =
                () -> readCapped(process.getInputStream());
        java.util.concurrent.Callable<byte[]> readStderr =
                () -> readCapped(process.getErrorStream());
        Future<byte[]> stdoutFuture = streamReaderPool.submit(readStdout);
        Future<byte[]> stderrFuture = streamReaderPool.submit(readStderr);

        boolean finished;
        try {
            finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            process.destroyForcibly();
            Thread.currentThread().interrupt();
            return failure("Execution was interrupted");
        }

        if (!finished) {
            process.destroyForcibly();
            awaitQuietly(stdinWriter);
            String message = "compile".equals(phase)
                    ? "Compilation timed out after " + COMPILE_TIMEOUT_MS + " ms"
                    : "Execution timed out after " + (RUN_TIMEOUT_MS / 1000.0) +
                      " seconds (possible infinite loop)";
            CodeExecutionResponse response = new CodeExecutionResponse();
            response.setCompilationSuccessful("compile".equals(phase) ? false : true);
            if ("compile".equals(phase)) {
                response.setCompilationError(message);
            } else {
                response.setRuntimeError(message);
            }
            return response;
        }

        int exitCode = process.exitValue();
        // Strip the temporary workspace path from diagnostics so users never
        // see internal server directories.
        String basePath = workingDir.getAbsolutePath() + File.separator;
        String stdout = toStringCapped(awaitQuietly(stdoutFuture)).replace(basePath, "");
        String stderr = toStringCapped(awaitQuietly(stderrFuture)).replace(basePath, "");

        CodeExecutionResponse response = new CodeExecutionResponse();
        if ("compile".equals(phase)) {
            if (exitCode == 0) {
                response.setCompilationSuccessful(true);
            } else {
                response.setCompilationSuccessful(false);
                response.setCompilationError(firstNonBlank(stderr, stdout,
                        "Compilation failed with exit code " + exitCode));
            }
            return response;
        }

        response.setCompilationSuccessful(true);
        response.setOutput(stdout);
        if (exitCode != 0) {
            response.setRuntimeError(firstNonBlank(stderr, stdout,
                    "Process exited with non-zero exit code " + exitCode));
        }
        return response;
    }

    private byte[] readCapped(java.io.InputStream stream) {
        try {
            byte[] all = stream.readAllBytes();
            if (all.length > MAX_OUTPUT_BYTES) {
                byte[] capped = new byte[MAX_OUTPUT_BYTES];
                System.arraycopy(all, 0, capped, 0, MAX_OUTPUT_BYTES);
                byte[] notice = "\n[output truncated]".getBytes(StandardCharsets.UTF_8);
                byte[] merged = new byte[MAX_OUTPUT_BYTES + notice.length];
                System.arraycopy(capped, 0, merged, 0, MAX_OUTPUT_BYTES);
                System.arraycopy(notice, 0, merged, MAX_OUTPUT_BYTES, notice.length);
                return merged;
            }
            return all;
        } catch (IOException e) {
            return new byte[0];
        }
    }

    // ------------------------------------------------------------------
    // Guards and helpers
    // ------------------------------------------------------------------

    private void enforceRateLimit(String username) {
        if (username == null || username.isBlank()) {
            return;
        }
        long now = System.currentTimeMillis();
        Long previous = lastRunByUser.get(username);
        if (previous != null && now - previous < USER_COOLDOWN_MS) {
            throw new RateLimitException(
                    "You are running code too quickly. Please wait a second and try again.");
        }
        lastRunByUser.put(username, now);
        if (lastRunByUser.size() > 10_000) {
            lastRunByUser.clear();
        }
    }

    private PathHolder createWorkspace() throws IOException {
        PathHolder holder = new PathHolder();
        holder.dir = Files.createTempDirectory("cc-exec-").toFile();
        return holder;
    }

    private void deleteRecursively(File dir) {
        if (dir == null || !dir.exists()) {
            return;
        }
        try (var paths = Files.walk(dir.toPath())) {
            paths.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                    // Best-effort cleanup only.
                }
            });
        } catch (IOException ignored) {
            // Best-effort cleanup only.
        }
    }

    private String firstAvailableCommand(String language) {
        for (String candidate : RUNTIME_CANDIDATES.getOrDefault(language, List.of())) {
            if (isCommandAvailable(candidate, "--version")) {
                return candidate;
            }
        }
        throw new BadRequestException("No runtime available for language: " + language);
    }

    private boolean isCommandAvailable(String command, String versionFlag) {
        try {
            ProcessBuilder builder = new ProcessBuilder(command, versionFlag);
            builder.redirectErrorStream(true);
            Process process = builder.start();
            java.util.concurrent.Callable<byte[]> drain =
                    () -> readCapped(process.getInputStream());
            streamReaderPool.submit(drain);
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            return process.exitValue() == 0;
        } catch (IOException e) {
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    /**
     * Accepts {@code public class Foo} / {@code class Foo} and falls back to {@code Main}.
     * Starter templates use {@code Main}; this keeps custom class names compiling too.
     */
    private String extractJavaClassName(String sourceCode) {
        Matcher matcher = Pattern.compile("(?:public\\s+)?(?:final\\s+)?class\\s+([A-Za-z_$][\\w$]*)")
                .matcher(sourceCode);
        if (matcher.find()) {
            String candidate = matcher.group(1);
            if (!"record".equals(candidate) && !"enum".equals(candidate)) {
                return candidate;
            }
        }
        return "Main";
    }

    private CodeExecutionResponse failure(String message) {
        CodeExecutionResponse response = new CodeExecutionResponse();
        response.setCompilationSuccessful(false);
        response.setRuntimeError(message);
        return response;
    }

    private String toStringCapped(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return "";
        }
        return new String(bytes, StandardCharsets.UTF_8);
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate.strip();
            }
        }
        return "";
    }

    private byte[] awaitQuietly(Future<?> future) {
        try {
            Object bytes = future.get(1, TimeUnit.SECONDS);
            return (bytes instanceof byte[] arr) ? arr : new byte[0];
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new byte[0];
        } catch (ExecutionException | TimeoutException ignored) {
            // Reader/writer thread failed or hung; ignore — output is already capped.
            return new byte[0];
        }
    }

    private String safeMessage(Exception e) {
        String message = e.getMessage();
        if (message == null || message.isBlank()) {
            return e.getClass().getSimpleName();
        }
        return message.length() > 200 ? message.substring(0, 200) : message;
    }

    private static final class PathHolder {
        private File dir;
    }
}
