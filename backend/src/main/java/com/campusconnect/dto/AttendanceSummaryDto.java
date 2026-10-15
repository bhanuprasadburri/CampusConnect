package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDto {
    private BigDecimal overallPercentage;
    private long totalConducted;
    private long totalAttended;
    private long totalMissed;
    private BigDecimal monthlyPercentage;
    private String requirementNote;
    private List<SubjectAttendanceDto> subjectAttendance;
}
