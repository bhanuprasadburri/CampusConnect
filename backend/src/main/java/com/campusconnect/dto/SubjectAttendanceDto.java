package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectAttendanceDto {
    private String subjectId;
    private String subjectCode;
    private String subjectName;
    private long totalConducted;
    private long totalAttended;
    private BigDecimal percentage;
    private String status; // On track / Shortage
}
