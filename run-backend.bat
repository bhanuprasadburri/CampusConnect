@echo off
echo Starting CampusConnect Spring Boot Backend...
call "%~dp0backend\mvnw.cmd" clean spring-boot:run
pause
