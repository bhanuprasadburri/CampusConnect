package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_drives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "job_role", nullable = false)
    private String jobRole;

    @Column(name = "package_lpa", nullable = false)
    private String packageLpa;

    @Column(name = "min_cgpa")
    @Builder.Default
    private BigDecimal minCgpa = BigDecimal.ZERO;

    @Column(name = "eligible_branches")
    private String eligibleBranches;

    @Column(nullable = false)
    private LocalDate deadline;

    @Builder.Default
    private String status = "OPEN"; // OPEN, CLOSED, UPCOMING

    @Column(name = "company_logo")
    private String companyLogo;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
