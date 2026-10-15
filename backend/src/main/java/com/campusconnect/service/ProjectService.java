package com.campusconnect.service;

import com.campusconnect.dto.CreateProjectRequest;
import com.campusconnect.dto.ProjectDto;
import com.campusconnect.dto.UpdateProjectRequest;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.exception.UnauthorizedException;
import com.campusconnect.model.Project;
import com.campusconnect.model.ProjectStatus;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectDto> getStudentProjects(StudentProfile student) {
        List<Project> projects = projectRepository.findByStudentOrderByCreatedAtDesc(student);
        return projects.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto createProject(StudentProfile student, CreateProjectRequest request) {
        Project project = Project.builder()
                .institutionId(student.getInstitutionId())
                .student(student)
                .title(request.getTitle())
                .domain(request.getDomain())
                .description(request.getDescription())
                .guideName(request.getGuideName() != null ? request.getGuideName() : "Assigned Faculty Guide")
                .teamMembers(request.getTeamMembers() != null ? request.getTeamMembers() : student.getFirstName() + " " + student.getLastName())
                .githubUrl(request.getGithubUrl())
                .demoUrl(request.getDemoUrl())
                .status(ProjectStatus.PROPOSED)
                .createdAt(LocalDateTime.now())
                .build();

        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    @Transactional
    public ProjectDto updateProject(StudentProfile student, String projectId, UpdateProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (!project.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("Cannot modify project belonging to another student");
        }

        if (request.getTitle() != null) project.setTitle(request.getTitle());
        if (request.getDomain() != null) project.setDomain(request.getDomain());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getGuideName() != null) project.setGuideName(request.getGuideName());
        if (request.getTeamMembers() != null) project.setTeamMembers(request.getTeamMembers());
        if (request.getGithubUrl() != null) project.setGithubUrl(request.getGithubUrl());
        if (request.getDemoUrl() != null) project.setDemoUrl(request.getDemoUrl());
        if (request.getStatus() != null) project.setStatus(request.getStatus());

        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    private ProjectDto mapToDto(Project p) {
        return ProjectDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .domain(p.getDomain())
                .description(p.getDescription())
                .guideName(p.getGuideName())
                .teamMembers(p.getTeamMembers())
                .githubUrl(p.getGithubUrl())
                .demoUrl(p.getDemoUrl())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
