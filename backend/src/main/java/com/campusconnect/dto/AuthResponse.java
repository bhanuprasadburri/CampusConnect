package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private String userId;
    private String username;
    private String email;
    private String role;
    private String studentId;
    private String institutionId;
    private String institutionName;
    private String fullName;
}
