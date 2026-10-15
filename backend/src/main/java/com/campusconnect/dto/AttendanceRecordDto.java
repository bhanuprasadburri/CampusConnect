package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordDto {
    private String id;
    private String subjectCode;
    private String subjectName;
    private LocalDate sessionDate;
    private Integer periodNumber;
    private String status;
    private String remarks;
}
