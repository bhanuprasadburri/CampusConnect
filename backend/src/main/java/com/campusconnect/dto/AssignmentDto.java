package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDto {
    private String id;
    private String subjectId;
    private String subjectCode;
    private String subjectName;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Integer maxMarks;
    private boolean submitted;
    private String submissionStatus; // Pending, Submitted, Graded
    private LocalDateTime submittedAt;
    private String submissionFileUrl;
    private String submissionRemarks;
    private BigDecimal marksObtained;
}
