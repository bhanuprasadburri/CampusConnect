package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(nullable = false)
    private String category; // Tuition Fee, Development Fee, Examination Fee, Semester Balance, Hostel Fee

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    @Builder.Default
    private String status = "DUE"; // PAID, DUE, OVERDUE

    @Column(name = "receipt_no")
    private String receiptNo;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}
