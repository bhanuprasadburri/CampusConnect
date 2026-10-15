package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    private Integer semester;

    @Column(name = "internal_marks")
    private BigDecimal internalMarks;

    @Column(name = "external_marks")
    private BigDecimal externalMarks;

    @Column(name = "total_marks", nullable = false)
    private BigDecimal totalMarks;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private Integer credits;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "exam_session")
    private String examSession;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
