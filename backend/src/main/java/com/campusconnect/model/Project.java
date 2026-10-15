package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String domain; // IoT, AI/ML, Web Application, Cloud, Mobile App

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "guide_name")
    private String guideName;

    @Column(name = "team_members", columnDefinition = "TEXT")
    private String teamMembers;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "demo_url")
    private String demoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.PROPOSED;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
