package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(name = "request_type", nullable = false)
    private String requestType; // BONAFIDE, TRANSCRIPT, ID_CARD, GRIEVANCE, OTHER

    @Column(nullable = false)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private String status = "PENDING"; // PENDING, IN_REVIEW, RESOLVED, REJECTED

    @Column(name = "resolution_remarks", columnDefinition = "TEXT")
    private String resolutionRemarks;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
