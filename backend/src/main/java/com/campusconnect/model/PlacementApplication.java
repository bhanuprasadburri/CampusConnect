package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"drive_id", "student_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drive_id", nullable = false)
    private PlacementDrive drive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Builder.Default
    @Column(name = "applied_at")
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Builder.Default
    private String status = "APPLIED"; // APPLIED, SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED

    private String remarks;
}
