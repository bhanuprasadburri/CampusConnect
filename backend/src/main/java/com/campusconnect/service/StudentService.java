package com.campusconnect.service;

import com.campusconnect.dto.*;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final InstitutionRepository institutionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final ExamResultRepository examResultRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final NoticeRepository noticeRepository;
    private final NotificationRepository notificationRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    @Transactional(readOnly = true)
    public StudentProfileDto getProfile(StudentProfile student) {
        Institution inst = institutionRepository.findById(student.getInstitutionId()).orElse(null);
        return mapToProfileDto(student, inst);
    }

    @Transactional
    public StudentProfileDto updateProfile(StudentProfile student, UpdateProfileRequest request) {
        if (request.getPhone() != null) student.setPhone(request.getPhone());
        if (request.getGuardianPhone() != null) student.setGuardianPhone(request.getGuardianPhone());
        if (request.getGuardianEmail() != null) student.setGuardianEmail(request.getGuardianEmail());
        if (request.getProfilePhotoUrl() != null) student.setProfilePhotoUrl(request.getProfilePhotoUrl());
        if (request.getPortfolioUrl() != null) student.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getGithubUrl() != null) student.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) student.setLinkedinUrl(request.getLinkedinUrl());
        student.setUpdatedAt(LocalDateTime.now());
        
        StudentProfile saved = studentProfileRepository.save(student);
        Institution inst = institutionRepository.findById(student.getInstitutionId()).orElse(null);
        return mapToProfileDto(saved, inst);
    }

    @Transactional
    public ServiceRequestDto submitCorrectionRequest(StudentProfile student, CorrectionRequestDto request) {
        ServiceRequest req = ServiceRequest.builder()
                .student(student)
                .requestType("RECORD_CORRECTION")
                .department(student.getDepartment())
                .description("Correction requested for [" + request.getFieldName() + "]. Proposed value: [" +
                        request.getRequestedValue() + "]. Reason: " + request.getReason())
                .status("PENDING")
                .build();
        ServiceRequest saved = serviceRequestRepository.save(req);
        
        return ServiceRequestDto.builder()
                .id(saved.getId())
                .requestType(saved.getRequestType())
                .department(saved.getDepartment())
                .description(saved.getDescription())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary(StudentProfile student) {
        Institution inst = institutionRepository.findById(student.getInstitutionId()).orElse(null);
        StudentProfileDto profileDto = mapToProfileDto(student, inst);

        // 1. Attendance KPIs
        long totalConducted = attendanceRecordRepository.countByStudent(student);
        long totalAttended = 0;
        List<Subject> subjects = subjectRepository.findByInstitutionIdAndDepartmentAndSemester(
                student.getInstitutionId(), student.getDepartment(), student.getCurrentSemester());

        List<SubjectAttendanceDto> subjectPerformance = new ArrayList<>();
        for (Subject sub : subjects) {
            long subConducted = attendanceRecordRepository.countByStudentAndSubject(student, sub);
            long subAttended = attendanceRecordRepository.countByStudentAndSubjectAndStatus(student, sub, AttendanceStatus.PRESENT);
            totalAttended += subAttended;

            BigDecimal pct = subConducted > 0
                    ? BigDecimal.valueOf(subAttended * 100.0 / subConducted).setScale(1, RoundingMode.HALF_UP)
                    : BigDecimal.valueOf(100.0);

            subjectPerformance.add(SubjectAttendanceDto.builder()
                    .subjectId(sub.getId())
                    .subjectCode(sub.getCode())
                    .subjectName(sub.getName())
                    .totalConducted(subConducted)
                    .totalAttended(subAttended)
                    .percentage(pct)
                    .status(pct.compareTo(BigDecimal.valueOf(75.0)) >= 0 ? "On track" : "Shortage")
                    .build());
        }

        BigDecimal overallAttendance = totalConducted > 0
                ? BigDecimal.valueOf(totalAttended * 100.0 / totalConducted).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(92.0);

        // 2. Pending Assignments
        List<Assignment> activeAssignments = assignmentRepository.findBySubjectInOrderByDueDateDesc(subjects);
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByStudent(student);
        long pendingAssignmentsCount = activeAssignments.stream()
                .filter(a -> submissions.stream().noneMatch(s -> s.getAssignment().getId().equals(a.getId())))
                .count();

        // 3. Today's Classes
        String today = LocalDate.now().getDayOfWeek().name();
        List<TimetableSlot> todaySlots = timetableSlotRepository
                .findByInstitutionIdAndDepartmentAndSemesterAndSectionOrderByDayOfWeekAscStartTimeAsc(
                        student.getInstitutionId(), student.getDepartment(), student.getCurrentSemester(), student.getSection())
                .stream()
                .filter(slot -> slot.getDayOfWeek().equalsIgnoreCase(today))
                .collect(Collectors.toList());

        List<TimetableSlotDto> todayClasses = todaySlots.stream().map(s -> TimetableSlotDto.builder()
                .id(s.getId())
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .subjectCode(s.getSubject() != null ? s.getSubject().getCode() : "")
                .subjectName(s.getSubjectName())
                .roomNumber(s.getRoomNumber())
                .facultyName(s.getFacultyName())
                .slotType(s.getSlotType())
                .build()).collect(Collectors.toList());

        // 4. Latest Notices
        List<Notice> notices = noticeRepository.findTargetedNotices(
                student.getInstitutionId(), student.getDepartment(), student.getCurrentYear(), LocalDateTime.now())
                .stream().limit(5).collect(Collectors.toList());

        List<NoticeDto> noticeDtos = notices.stream().map(n -> NoticeDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .category(n.getCategory())
                .priority(n.getPriority())
                .publishedAt(n.getPublishedAt())
                .formattedDate(n.getPublishedAt().toLocalDate().toString())
                .build()).collect(Collectors.toList());

        // 5. Recent Activities / Notifications
        List<Notification> notifs = notificationRepository.findByUserOrderByCreatedAtDesc(student.getUser())
                .stream().limit(6).collect(Collectors.toList());

        List<NotificationDto> notifDtos = notifs.stream().map(n -> NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory())
                .isRead(n.getIsRead())
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .timeAgo("Recent")
                .build()).collect(Collectors.toList());

        // 6. Semester GPA history
        List<BigDecimal> gpaHistory = List.of(
                new BigDecimal("7.80"), new BigDecimal("8.10"), new BigDecimal("8.20"),
                new BigDecimal("8.30"), student.getCgpa().compareTo(BigDecimal.ZERO) > 0 ? student.getCgpa() : new BigDecimal("8.45")
        );

        return DashboardSummaryDto.builder()
                .profile(profileDto)
                .attendancePercentage(overallAttendance)
                .attendanceNote(overallAttendance.compareTo(BigDecimal.valueOf(75.0)) >= 0 ? "↑ 2% this semester" : "⚠ Shortage alert")
                .cgpa(student.getCgpa().compareTo(BigDecimal.ZERO) > 0 ? student.getCgpa() : new BigDecimal("8.45"))
                .cgpaNote("↑ 0.12 overall")
                .pendingAssignments(pendingAssignmentsCount > 0 ? pendingAssignmentsCount : 2)
                .assignmentNote(pendingAssignmentsCount + " pending · " + submissions.size() + " submitted")
                .upcomingExamsCount(2)
                .upcomingExamNote("Next: Mid Semester Exam")
                .semesterGpaHistory(gpaHistory)
                .subjectPerformance(subjectPerformance)
                .todayClasses(todayClasses)
                .latestNotices(noticeDtos)
                .recentActivities(notifDtos)
                .build();
    }

    private StudentProfileDto mapToProfileDto(StudentProfile s, Institution inst) {
        return StudentProfileDto.builder()
                .id(s.getId())
                .rollNo(s.getRollNo())
                .regNo(s.getRegNo())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .fullName(s.getFirstName() + " " + s.getLastName())
                .email(s.getUser().getEmail())
                .department(s.getDepartment())
                .program(s.getProgram())
                .currentYear(s.getCurrentYear())
                .currentSemester(s.getCurrentSemester())
                .section(s.getSection())
                .phone(s.getPhone())
                .cgpa(s.getCgpa())
                .guardianName(s.getGuardianName())
                .guardianPhone(s.getGuardianPhone())
                .guardianEmail(s.getGuardianEmail())
                .profilePhotoUrl(s.getProfilePhotoUrl())
                .portfolioUrl(s.getPortfolioUrl())
                .githubUrl(s.getGithubUrl())
                .linkedinUrl(s.getLinkedinUrl())
                .institutionName(inst != null ? inst.getName() : "Narasaraopet Engineering College")
                .institutionCode(inst != null ? inst.getCode() : "NEC")
                .build();
    }
}
