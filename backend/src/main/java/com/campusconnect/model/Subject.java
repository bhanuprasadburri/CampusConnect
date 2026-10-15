package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    private Integer credits = 3;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private String department;

    @Column(name = "faculty_name")
    private String facultyName;

    @Builder.Default
    private String icon = "📘";

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
