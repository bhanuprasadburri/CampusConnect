package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "institution_id", nullable = false)
    private String institutionId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private String category; // ACADEMIC, EXAMINATION, PLACEMENT, GENERAL, EVENT

    @Builder.Default
    private String priority = "NORMAL"; // NORMAL, HIGH, URGENT

    @Column(name = "target_dept")
    private String targetDept;

    @Column(name = "target_year")
    private Integer targetYear;

    @Builder.Default
    @Column(name = "published_at")
    private LocalDateTime publishedAt = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
}
