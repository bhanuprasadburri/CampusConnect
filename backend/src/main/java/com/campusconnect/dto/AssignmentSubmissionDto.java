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
public class AssignmentSubmissionDto {
    private String id;
    private String assignmentId;
    private String assignmentTitle;
    private LocalDateTime submissionDate;
    private String fileUrl;
    private String remarks;
    private String status;
    private BigDecimal marksObtained;
}
