package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {
    @NotBlank(message = "Project title is required")
    private String title;

    @NotBlank(message = "Domain is required (e.g. IoT, AI/ML, Web Application)")
    private String domain;

    private String description;
    private String guideName;
    private String teamMembers;
    private String githubUrl;
    private String demoUrl;
}
