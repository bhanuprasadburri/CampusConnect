package com.campusconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentWardOverviewDto {
    private StudentProfileDto profile;
    private AttendanceSummaryDto attendance;
    private List<AttendanceRecordDto> attendanceHistory;
    private List<SemesterResultDto> results;
    private List<AssignmentDto> assignments;
    private List<FeeRecordDto> fees;
    private List<NoticeDto> notices;
    private List<NotificationDto> notifications;
    private List<TimetableSlotDto> timetable;
    private List<ServiceRequestDto> requests;
}
