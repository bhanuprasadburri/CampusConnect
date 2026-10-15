package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(name = "roll_no", nullable = false, unique = true)
    private String rollNo;

    @Column(name = "reg_no", nullable = false, unique = true)
    private String regNo;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String program;

    @Column(name = "current_year", nullable = false)
    private Integer currentYear;

    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    @Column(nullable = false)
    private String section;

    private String phone;

    @Builder.Default
    private BigDecimal cgpa = BigDecimal.ZERO;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "guardian_phone")
    private String guardianPhone;

    @Column(name = "guardian_email")
    private String guardianEmail;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
