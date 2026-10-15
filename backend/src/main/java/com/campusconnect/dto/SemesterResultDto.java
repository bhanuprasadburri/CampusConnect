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
public class SemesterResultDto {
    private Integer semester;
    private String semesterName;
    private BigDecimal sgpa;
    private Integer totalCredits;
    private String resultStatus;
    private List<ExamResultDto> subjects;
}
