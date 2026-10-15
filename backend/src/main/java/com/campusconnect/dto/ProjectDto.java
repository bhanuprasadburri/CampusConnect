package com.campusconnect.dto;

import com.campusconnect.model.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private String id;
    private String title;
    private String domain;
    private String description;
    private String guideName;
    private String teamMembers;
    private String githubUrl;
    private String demoUrl;
    private ProjectStatus status;
    private LocalDateTime createdAt;
}
