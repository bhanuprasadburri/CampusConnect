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
public class ExamResultDto {
    private String id;
    private String subjectCode;
    private String subjectName;
    private Integer semester;
    private BigDecimal internalMarks;
    private BigDecimal externalMarks;
    private BigDecimal totalMarks;
    private String grade;
    private Integer credits;
    private String examSession;
}
