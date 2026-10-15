@echo off
setlocal
set "MAVEN_HOME=%~dp0..\.tools\apache-maven-3.9.16"

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
  echo Project Maven installation was not found at "%MAVEN_HOME%".
  exit /b 1
)

pushd "%~dp0"
call "%MAVEN_HOME%\bin\mvn.cmd" %*
set "MAVEN_EXIT=%ERRORLEVEL%"
popd
exit /b %MAVEN_EXIT%
