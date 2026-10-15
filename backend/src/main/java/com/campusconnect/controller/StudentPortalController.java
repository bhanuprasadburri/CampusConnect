package com.campusconnect.controller;

import com.campusconnect.dto.*;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.model.Subject;
import com.campusconnect.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student")
@RequiredArgsConstructor
@Tag(name = "Student Portal", description = "Endpoints for student dashboard, attendance, academics, placements, projects, and campus services")
public class StudentPortalController {

    private final AuthService authService;
    private final StudentService studentService;
    private final AttendanceService attendanceService;
    private final AcademicService academicService;
    private final AssignmentService assignmentService;
    private final ProjectService projectService;
    private final PlacementService placementService;
    private final NoticeService noticeService;
    private final NotificationService notificationService;
    private final ServiceRequestService serviceRequestService;
    private final FeeService feeService;

    // 1. Dashboard & Profile
    @GetMapping("/dashboard")
    @Operation(summary = "Get consolidated student dashboard summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboard(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(studentService.getDashboardSummary(student)));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get student profile details")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getProfile(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(studentService.getProfile(student)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update permitted student contact and portfolio links")
    public ResponseEntity<ApiResponse<StudentProfileDto>> updateProfile(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody UpdateProfileRequest request) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", studentService.updateProfile(student, request)));
    }

    @PostMapping("/profile/correction-request")
    @Operation(summary = "Submit an official record correction request")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> submitCorrectionRequest(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody CorrectionRequestDto request) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok("Correction request submitted to department office", 
                studentService.submitCorrectionRequest(student, request)));
    }

    // 2. Attendance
    @GetMapping("/attendance/summary")
    @Operation(summary = "Get overall and subject-wise attendance statistics")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getAttendanceSummary(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceSummary(student)));
    }

    @GetMapping("/attendance/history")
    @Operation(summary = "Get chronological daily attendance log")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getAttendanceHistory(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceHistory(student)));
    }

    // 3. Timetable & Courses
    @GetMapping("/timetable")
    @Operation(summary = "Get current semester weekly timetable")
    public ResponseEntity<ApiResponse<List<TimetableSlotDto>>> getTimetable(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(academicService.getTimetable(student)));
    }

    @GetMapping("/courses")
    @Operation(summary = "Get enrolled courses and syllabus modules")
    public ResponseEntity<ApiResponse<List<Subject>>> getCourses(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(academicService.getEnrolledCourses(student)));
    }

    // 4. Academics & Examinations
    @GetMapping("/academics/results")
    @Operation(summary = "Get published semester SGPA/CGPA marksheets")
    public ResponseEntity<ApiResponse<List<SemesterResultDto>>> getAcademicResults(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(academicService.getPublishedResults(student)));
    }

    // 5. Assignments
    @GetMapping("/assignments")
    @Operation(summary = "Get list of active and submitted assignments")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getAssignments(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getStudentAssignments(student)));
    }

    @PostMapping("/assignments/{id}/submit")
    @Operation(summary = "Submit solution for an assignment")
    public ResponseEntity<ApiResponse<AssignmentSubmissionDto>> submitAssignment(
            @AuthenticationPrincipal String username,
            @PathVariable("id") String assignmentId,
            @Valid @RequestBody SubmitAssignmentRequest request) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok("Assignment submitted successfully",
                assignmentService.submitAssignment(student, assignmentId, request)));
    }

    // 6. Projects & Innovation
    @GetMapping("/projects")
    @Operation(summary = "Get student's project proposals and innovations")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getProjects(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(projectService.getStudentProjects(student)));
    }

    @PostMapping("/projects")
    @Operation(summary = "Submit a new project proposal")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody CreateProjectRequest request) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok("Project proposal submitted for review",
                projectService.createProject(student, request)));
    }

    @PutMapping("/projects/{id}")
    @Operation(summary = "Update student project details or code repository link")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @AuthenticationPrincipal String username,
            @PathVariable("id") String projectId,
            @Valid @RequestBody UpdateProjectRequest request) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully",
                projectService.updateProject(student, projectId, request)));
    }

    // 7. Placements & Careers
    @GetMapping("/placements/drives")
    @Operation(summary = "Get available placement drives and eligibility status")
    public ResponseEntity<ApiResponse<List<PlacementDriveDto>>> getPlacementDrives(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(placementService.getPlacementDrives(student)));
    }

    @PostMapping("/placements/apply/{driveId}")
    @Operation(summary = "Apply for an eligible placement drive")
    public ResponseEntity<ApiResponse<PlacementApplicationDto>> applyForDrive(
            @AuthenticationPrincipal String username,
            @PathVariable("driveId") String driveId) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok("Application submitted successfully",
                placementService.applyForDrive(student, driveId)));
    }

    @GetMapping("/placements/my-applications")
    @Operation(summary = "Get student placement application history")
    public ResponseEntity<ApiResponse<List<PlacementApplicationDto>>> getMyPlacementApplications(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(placementService.getMyApplications(student)));
    }

    // 8. Notices & Notifications
    @GetMapping("/notices")
    @Operation(summary = "Get official targeted college and department announcements")
    public ResponseEntity<ApiResponse<List<NoticeDto>>> getNotices(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(noticeService.getTargetedNotices(student)));
    }

    @GetMapping("/notifications")
    @Operation(summary = "Get in-app user notifications")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(student.getUser())));
    }

    @PatchMapping("/notifications/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(
            @AuthenticationPrincipal String username,
            @PathVariable("id") String notificationId) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        notificationService.markAsRead(student.getUser(), notificationId);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PostMapping("/notifications/mark-all-read")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        notificationService.markAllAsRead(student.getUser());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    // 9. Campus Services & Fee Records
    @GetMapping("/services/requests")
    @Operation(summary = "Get list of submitted campus service requests")
    public ResponseEntity<ApiResponse<List<ServiceRequestDto>>> getServiceRequests(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(serviceRequestService.getStudentRequests(student)));
    }

    @PostMapping("/services/requests")
    @Operation(summary = "Submit a new campus service request (e.g., Bonafide, Transcript)")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> createServiceRequest(
            @AuthenticationPrincipal String username,
            @Valid @RequestBody CreateServiceRequestDto request) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok("Service request submitted successfully",
                serviceRequestService.createRequest(student, request)));
    }

    @GetMapping("/fees")
    @Operation(summary = "Get fee breakdown, balances, and payment receipts")
    public ResponseEntity<ApiResponse<List<FeeRecordDto>>> getFeeRecords(@AuthenticationPrincipal String username) {
        StudentProfile student = authService.getAuthenticatedStudent(username);
        return ResponseEntity.ok(ApiResponse.ok(feeService.getFeeRecords(student)));
    }
}
