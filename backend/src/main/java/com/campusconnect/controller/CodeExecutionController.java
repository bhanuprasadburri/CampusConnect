package com.campusconnect.controller;

import com.campusconnect.dto.*;
import com.campusconnect.exception.UnauthorizedException;
import com.campusconnect.service.CodeExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/student/code")
@RequiredArgsConstructor
@Tag(name = "Code Execution", description = "Secure code execution for coding practice problems")
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;

    @PostMapping("/execute")
    @Operation(summary = "Execute source code in a sandboxed environment")
    public ResponseEntity<ApiResponse<CodeExecutionResponse>> executeCode(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody CodeExecutionRequest request) {
        // Identity is derived from the server-side JWT principal, never from the request body.
        if (username == null || username.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }
        CodeExecutionResponse response = codeExecutionService.executeCode(username, request);
        return ResponseEntity.ok(ApiResponse.ok("Code executed successfully", response));
    }

    @GetMapping("/supported-languages")
    @Operation(summary = "Get list of supported programming languages")
    public ResponseEntity<ApiResponse<List<String>>> getSupportedLanguages() {
        List<String> languages = codeExecutionService.getSupportedLanguages();
        return ResponseEntity.ok(ApiResponse.ok("Supported languages", languages));
    }
}
