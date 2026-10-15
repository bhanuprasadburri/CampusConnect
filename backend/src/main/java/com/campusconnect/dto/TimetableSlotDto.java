package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableSlotDto {
    private String id;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String subjectCode;
    private String subjectName;
    private String roomNumber;
    private String facultyName;
    private String slotType;
}
