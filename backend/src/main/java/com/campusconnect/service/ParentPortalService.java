package com.campusconnect.service;

import com.campusconnect.dto.ParentWardOverviewDto;
import com.campusconnect.dto.StudentProfileDto;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.exception.UnauthorizedException;
import com.campusconnect.model.Role;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.model.User;
import com.campusconnect.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentPortalService {
    private final StudentProfileRepository studentProfileRepository;
    private final StudentService studentService;
    private final AttendanceService attendanceService;
    private final AcademicService academicService;
    private final AssignmentService assignmentService;
    private final FeeService feeService;
    private final NoticeService noticeService;
    private final NotificationService notificationService;
    private final ServiceRequestService serviceRequestService;

    @Transactional(readOnly = true)
    public List<StudentProfileDto> getWards(User parent) {
        return linkedWards(parent).stream().map(studentService::getProfile).toList();
    }

    @Transactional(readOnly = true)
    public ParentWardOverviewDto getWardOverview(User parent, String wardId) {
        StudentProfile ward = linkedWards(parent).stream()
                .filter(profile -> profile.getId().equals(wardId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Linked student was not found"));

        return ParentWardOverviewDto.builder()
                .profile(studentService.getProfile(ward))
                .attendance(attendanceService.getAttendanceSummary(ward))
                .attendanceHistory(attendanceService.getAttendanceHistory(ward))
                .results(academicService.getPublishedResults(ward))
                .assignments(assignmentService.getStudentAssignments(ward))
                .fees(feeService.getFeeRecords(ward))
                .notices(noticeService.getTargetedNotices(ward))
                .notifications(notificationService.getUserNotifications(ward.getUser()))
                .timetable(academicService.getTimetable(ward))
                .requests(serviceRequestService.getStudentRequests(ward))
                .build();
    }

    private List<StudentProfile> linkedWards(User parent) {
        if (parent.getRole() != Role.ROLE_PARENT) {
            throw new UnauthorizedException("Parent account required");
        }
        return studentProfileRepository.findByGuardianEmailIgnoreCaseAndInstitutionId(
                parent.getEmail(), parent.getInstitutionId());
    }
}
