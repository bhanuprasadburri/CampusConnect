package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"assignment_id", "student_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Builder.Default
    @Column(name = "submission_date")
    private LocalDateTime submissionDate = LocalDateTime.now();

    @Column(name = "file_url")
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "marks_obtained")
    private BigDecimal marksObtained;

    @Builder.Default
    private String status = "SUBMITTED"; // PENDING, SUBMITTED, GRADED
}
