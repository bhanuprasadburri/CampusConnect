package com.campusconnect.controller;

import com.campusconnect.dto.ApiResponse;
import com.campusconnect.dto.AuthRequest;
import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.StudentProfileDto;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for student login, profile verification, and token exchange")
public class AuthController {

    private final AuthService authService;
    private final StudentService studentService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and receive JWT bearer token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated student profile")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getCurrentUser(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        StudentProfileDto profileDto = studentService.getProfile(student);
        return ResponseEntity.ok(ApiResponse.ok(profileDto));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user (client-side token removal)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }
}
