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
public class DashboardSummaryDto {
    private StudentProfileDto profile;
    private BigDecimal attendancePercentage;
    private String attendanceNote;
    private BigDecimal cgpa;
    private String cgpaNote;
    private long pendingAssignments;
    private String assignmentNote;
    private long upcomingExamsCount;
    private String upcomingExamNote;
    
    private List<BigDecimal> semesterGpaHistory;
    private List<SubjectAttendanceDto> subjectPerformance;
    private List<TimetableSlotDto> todayClasses;
    private List<NoticeDto> latestNotices;
    private List<NotificationDto> recentActivities;
    private List<ExamResultDto> upcomingExams;
}
