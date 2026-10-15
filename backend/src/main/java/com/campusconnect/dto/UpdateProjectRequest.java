package com.campusconnect.dto;

import com.campusconnect.model.ProjectStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {
    @Size(max = 200, message = "Project title is too long")
    private String title;

    @Size(max = 200, message = "Domain is too long")
    private String domain;

    @Size(max = 5000, message = "Description is too long")
    private String description;

    @Size(max = 300, message = "Guide name is too long")
    private String guideName;

    @Size(max = 500, message = "Team members value is too long")
    private String teamMembers;

    @Size(max = 500, message = "GitHub URL is too long")
    private String githubUrl;

    @Size(max = 500, message = "Demo URL is too long")
    private String demoUrl;

    private ProjectStatus status;
}
