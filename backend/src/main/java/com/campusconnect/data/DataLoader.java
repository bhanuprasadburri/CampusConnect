package com.campusconnect.data;

import com.campusconnect.model.*;
import com.campusconnect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final ExamResultRepository examResultRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final ProjectRepository projectRepository;
    private final PlacementDriveRepository placementDriveRepository;
    private final PlacementApplicationRepository placementApplicationRepository;
    private final NoticeRepository noticeRepository;
    private final NotificationRepository notificationRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (institutionRepository.count() > 0) {
            ensureDemoAssignmentCoverage();
            ensureDemoParentAccount();
            log.info("Database already seeded with demo data.");
            return;
        }

        log.info("Seeding initial demo data for College Digital Ecosystem...");

        // 1. Institution
        Institution nec = Institution.builder()
                .name("Narasaraopet Engineering College")
                .code("NEC")
                .logoUrl("https://www.nrtec.in/wp-content/uploads/2018/05/logo-nec1.png")
                .website("https://nrtec.in")
                .build();
        nec = institutionRepository.save(nec);

        // 2. Student User Account
        User studentUser = User.builder()
                .institutionId(nec.getId())
                .email("student@college.edu")
                .username("22CS001")
                .passwordHash(passwordEncoder.encode("Password@123"))
                .role(Role.ROLE_STUDENT)
                .status("ACTIVE")
                .build();
        studentUser = userRepository.save(studentUser);

        // 3. Student Profile
        StudentProfile student = StudentProfile.builder()
                .user(studentUser)
                .institutionId(nec.getId())
                .rollNo("22CS001")
                .regNo("228N1A0501")
                .firstName("Bhanu Prasad")
                .lastName("Burri")
                .department("Computer Science & Engineering")
                .program("B.Tech")
                .currentYear(3)
                .currentSemester(5)
                .section("CSE-B")
                .phone("+91 98765 43210")
                .cgpa(new BigDecimal("8.45"))
                .guardianName("Srinivasa Rao Burri")
                .guardianPhone("+91 98765 00000")
                .guardianEmail("parent@college.edu")
                .profilePhotoUrl("")
                .build();
        student = studentProfileRepository.save(student);

        // 4. Subjects
        List<Subject> subjects = new ArrayList<>();
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS501").name("Database Management Systems").credits(4).semester(5).department("Computer Science & Engineering").facultyName("Prof. R. Kumar").icon("🗄️").build());
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS502").name("Web Technologies").credits(3).semester(5).department("Computer Science & Engineering").facultyName("Prof. P. Reddy").icon("💻").build());
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS503").name("Data Structures & Algorithms").credits(4).semester(5).department("Computer Science & Engineering").facultyName("Prof. A. Singh").icon("🧩").build());
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS504").name("Computer Networks").credits(3).semester(5).department("Computer Science & Engineering").facultyName("Prof. N. Sharma").icon("🌐").build());
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS505").name("Operating Systems").credits(3).semester(5).department("Computer Science & Engineering").facultyName("Prof. S. Patel").icon("⚙️").build());
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS506").name("Software Engineering").credits(3).semester(5).department("Computer Science & Engineering").facultyName("Prof. M. Rao").icon("📐").build());
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS507").name("Mathematics").credits(3).semester(5).department("Computer Science & Engineering").facultyName("Prof. T. Lakshmi").icon("📊").build());
        subjects.add(Subject.builder().institutionId(nec.getId()).code("CS508").name("Computer Organization and Architecture").credits(4).semester(5).department("Computer Science & Engineering").facultyName("Prof. V. Kiran").icon("🖥️").build());
        subjects = subjectRepository.saveAll(subjects);

        // 5. Attendance Records
        LocalDate startDate = LocalDate.now().minusWeeks(4);
        int schoolDay = 0;
        for (LocalDate date = startDate; !date.isAfter(LocalDate.now()); date = date.plusDays(1)) {
            if (date.getDayOfWeek().getValue() == 7) continue; // College attendance is recorded Monday through Saturday.
            for (int p = 0; p < subjects.size(); p++) {
                Subject sub = subjects.get(p);
                AttendanceStatus status = (schoolDay % 5 == 0 && p == 2) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
                attendanceRecordRepository.save(AttendanceRecord.builder()
                        .student(student)
                        .subject(sub)
                        .sessionDate(date)
                        .periodNumber(p + 1)
                        .status(status)
                        .remarks(status == AttendanceStatus.PRESENT ? "Regular" : "Medical leave")
                        .build());
            }
            schoolDay++;
        }

        // 6. Timetable Slots
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"};
        String[][] timings = {
                {"09:00 AM", "09:50 AM"},
                {"10:00 AM", "10:50 AM"},
                {"11:00 AM", "11:50 AM"},
                {"11:50 AM", "12:40 PM"},
                {"01:30 PM", "02:20 PM"},
                {"02:20 PM", "03:10 PM"},
                {"03:10 PM", "04:00 PM"}
        };

        for (String day : days) {
            for (int t = 0; t < timings.length; t++) {
                Subject sub = subjects.get(t % subjects.size());
                timetableSlotRepository.save(TimetableSlot.builder()
                        .institutionId(nec.getId())
                        .department("Computer Science & Engineering")
                        .semester(5)
                        .section("CSE-B")
                        .dayOfWeek(day)
                        .startTime(timings[t][0])
                        .endTime(timings[t][1])
                        .subject(sub)
                        .subjectName(sub.getName())
                        .roomNumber("Room " + (301 + t))
                        .facultyName(sub.getFacultyName())
                        .slotType("LECTURE")
                        .build());
            }
        }

        // 7. Exam Results
        for (int sem = 1; sem <= 4; sem++) {
            BigDecimal sgpa = switch (sem) {
                case 1 -> new BigDecimal("7.80");
                case 2 -> new BigDecimal("8.10");
                case 3 -> new BigDecimal("8.20");
                case 4 -> new BigDecimal("8.30");
                default -> new BigDecimal("8.45");
            };
            for (Subject sub : subjects) {
                examResultRepository.save(ExamResult.builder()
                        .student(student)
                        .subject(sub)
                        .semester(sem)
                        .internalMarks(new BigDecimal("28.00"))
                        .externalMarks(new BigDecimal("62.00"))
                        .totalMarks(new BigDecimal("90.00"))
                        .grade("A+")
                        .credits(sub.getCredits())
                        .isPublished(true)
                        .examSession("Semester " + sem + " Regular 2023-2024")
                        .build());
            }
        }

        // 8. Assignments & Submissions
        Assignment a1 = assignmentRepository.save(Assignment.builder()
                .subject(subjects.get(1)) // Web Tech
                .title("Responsive Portfolio Website")
                .description("Build a modern personal portfolio using React and responsive CSS tokens.")
                .dueDate(LocalDateTime.now().plusDays(10))
                .maxMarks(100)
                .build());

        Assignment a2 = assignmentRepository.save(Assignment.builder()
                .subject(subjects.get(0)) // DBMS
                .title("SQL Complex Queries & Indexing")
                .description("Write complex nested SQL queries and index performance optimization reports.")
                .dueDate(LocalDateTime.now().plusDays(5))
                .maxMarks(50)
                .build());

        Assignment a3 = assignmentRepository.save(Assignment.builder()
                .subject(subjects.get(2)) // DSA
                .title("Graph Traversal Algorithms")
                .description("Implement BFS, DFS, and Dijkstra shortest path algorithms in Java/C++.")
                .dueDate(LocalDateTime.now().plusDays(3))
                .maxMarks(50)
                .build());

        assignmentRepository.save(Assignment.builder()
                .subject(subjects.get(3)) // Computer Networks
                .title("Network Protocol Analysis")
                .description("Analyze TCP/IP protocol behavior and document a packet trace.")
                .dueDate(LocalDateTime.now().plusDays(7))
                .maxMarks(50)
                .build());

        assignmentRepository.save(Assignment.builder()
                .subject(subjects.get(4)) // Operating Systems
                .title("CPU Scheduling Algorithms")
                .description("Compare scheduling strategies and implement Round Robin in Java.")
                .dueDate(LocalDateTime.now().plusDays(11))
                .maxMarks(50)
                .build());

        assignmentRepository.save(Assignment.builder()
                .subject(subjects.get(5)) // Software Engineering
                .title("Software Requirements Specification")
                .description("Prepare an SRS with functional requirements and use case diagrams.")
                .dueDate(LocalDateTime.now().plusDays(14))
                .maxMarks(50)
                .build());

        assignmentRepository.save(Assignment.builder()
                .subject(subjects.get(6)) // Mathematics
                .title("Applied Mathematics Problem Set")
                .description("Solve the semester problem set on probability and numerical methods.")
                .dueDate(LocalDateTime.now().plusDays(17))
                .maxMarks(50)
                .build());

        // Submission for a2
        assignmentSubmissionRepository.save(AssignmentSubmission.builder()
                .assignment(a2)
                .student(student)
                .submissionDate(LocalDateTime.now().minusDays(1))
                .fileUrl("https://github.com/bhanu/dbms-assignment")
                .remarks("Completed all 10 SQL exercises.")
                .marksObtained(new BigDecimal("48.00"))
                .status("GRADED")
                .build());

        // 9. Projects & Innovation
        projectRepository.save(Project.builder()
                .institutionId(nec.getId())
                .student(student)
                .title("Smart Attendance System with Face & QR Authentication")
                .domain("IoT · Web Application")
                .description("An automated attendance tracking platform utilizing AI camera vision and expiring dynamic QR codes.")
                .guideName("Prof. R. Kumar")
                .teamMembers("Bhanu Prasad Burri, Rahul S., Sneha K.")
                .githubUrl("https://github.com/bhanu/smart-attendance")
                .demoUrl("https://smart-attendance.demo.com")
                .status(ProjectStatus.IN_PROGRESS)
                .build());

        projectRepository.save(Project.builder()
                .institutionId(nec.getId())
                .student(student)
                .title("College Digital Ecosystem & Analytics Engine")
                .domain("Full-Stack Cloud SaaS")
                .description("Enterprise ERP system integrating student, parent, faculty and administrative operations.")
                .guideName("Prof. P. Reddy")
                .teamMembers("Bhanu Prasad Burri")
                .githubUrl("https://github.com/bhanu/campusconnect")
                .demoUrl("https://campusconnect.demo.com")
                .status(ProjectStatus.APPROVED)
                .build());

        // 10. Placement Drives
        PlacementDrive drive1 = placementDriveRepository.save(PlacementDrive.builder()
                .institutionId(nec.getId())
                .companyName("Tech Mahindra")
                .jobRole("Graduate Engineer Trainee")
                .packageLpa("₹4.2 LPA")
                .minCgpa(new BigDecimal("7.00"))
                .eligibleBranches("CSE, ECE, IT")
                .deadline(LocalDate.now().plusDays(8))
                .status("OPEN")
                .description("Full-time engineering roles in cloud infrastructure and enterprise applications.")
                .build());

        PlacementDrive drive2 = placementDriveRepository.save(PlacementDrive.builder()
                .institutionId(nec.getId())
                .companyName("Infosys")
                .jobRole("Systems Engineer Specialist")
                .packageLpa("₹6.5 LPA")
                .minCgpa(new BigDecimal("7.50"))
                .eligibleBranches("CSE, IT")
                .deadline(LocalDate.now().plusDays(12))
                .status("OPEN")
                .description("Specialist programming role focused on Java Spring Boot and React.")
                .build());

        PlacementDrive drive3 = placementDriveRepository.save(PlacementDrive.builder()
                .institutionId(nec.getId())
                .companyName("TCS")
                .jobRole("Digital Cadre")
                .packageLpa("₹7.2 LPA")
                .minCgpa(new BigDecimal("8.00"))
                .eligibleBranches("CSE, ECE, EEE, IT")
                .deadline(LocalDate.now().plusDays(18))
                .status("OPEN")
                .description("Digital innovation team role for cutting-edge AI and SaaS products.")
                .build());

        placementApplicationRepository.save(PlacementApplication.builder()
                .drive(drive1)
                .student(student)
                .appliedAt(LocalDateTime.now().minusDays(2))
                .status("SHORTLISTED")
                .remarks("Shortlisted for Round 1 Technical Assessment.")
                .build());

        // 11. Notices
        noticeRepository.save(Notice.builder()
                .institutionId(nec.getId())
                .title("College will remain closed on 2nd Oct for Gandhi Jayanthi")
                .content("Dear students and faculty, please note that the institution will observe a holiday on 2nd October in honor of Gandhi Jayanthi.")
                .category("GENERAL")
                .priority("NORMAL")
                .publishedAt(LocalDateTime.now().minusDays(2))
                .build());

        noticeRepository.save(Notice.builder()
                .institutionId(nec.getId())
                .title("Registration for Placement Training & Mock Interviews Now Open")
                .content("Final and pre-final year students must register for the mandatory corporate readiness training sessions before 10th October.")
                .category("PLACEMENT")
                .priority("HIGH")
                .publishedAt(LocalDateTime.now().minusDays(4))
                .build());

        noticeRepository.save(Notice.builder()
                .institutionId(nec.getId())
                .title("Mid-Semester Examination Schedule & Seating Allotment")
                .content("Mid-Semester Examinations for 3rd Year B.Tech students will commence from 12th October. Check the Examinations tab for seating.")
                .category("EXAMINATION")
                .priority("URGENT")
                .publishedAt(LocalDateTime.now().minusDays(1))
                .build());

        // 12. In-App Notifications
        notificationRepository.save(Notification.builder()
                .user(studentUser)
                .title("Assignment Graded")
                .message("Your submission for DBMS SQL Query Practice was graded: 48/50.")
                .category("ASSIGNMENT")
                .isRead(false)
                .actionUrl("/assignments")
                .build());

        notificationRepository.save(Notification.builder()
                .user(studentUser)
                .title("Attendance Updated")
                .message("Your attendance for Data Structures & Algorithms has been marked PRESENT.")
                .category("ATTENDANCE")
                .isRead(false)
                .actionUrl("/attendance")
                .build());

        notificationRepository.save(Notification.builder()
                .user(studentUser)
                .title("Fee Receipt Generated")
                .message("Fee receipt for ₹46,500 has been verified and recorded.")
                .category("FEE")
                .isRead(true)
                .actionUrl("/fees")
                .build());

        // 13. Fee Records
        feeRecordRepository.save(FeeRecord.builder()
                .student(student)
                .category("Tuition Fee")
                .amount(new BigDecimal("35000.00"))
                .dueDate(LocalDate.now().minusMonths(2))
                .status("PAID")
                .receiptNo("REC-2025-0814")
                .paidAt(LocalDateTime.now().minusMonths(2))
                .build());

        feeRecordRepository.save(FeeRecord.builder()
                .student(student)
                .category("Development Fee")
                .amount(new BigDecimal("5000.00"))
                .dueDate(LocalDate.now().minusMonths(2))
                .status("PAID")
                .receiptNo("REC-2025-0815")
                .paidAt(LocalDateTime.now().minusMonths(2))
                .build());

        feeRecordRepository.save(FeeRecord.builder()
                .student(student)
                .category("Examination Fee")
                .amount(new BigDecimal("3000.00"))
                .dueDate(LocalDate.now().minusMonths(1))
                .status("PAID")
                .receiptNo("REC-2025-0902")
                .paidAt(LocalDateTime.now().minusMonths(1))
                .build());

        feeRecordRepository.save(FeeRecord.builder()
                .student(student)
                .category("Semester Fee Balance")
                .amount(new BigDecimal("8500.00"))
                .dueDate(LocalDate.now().plusDays(8))
                .status("DUE")
                .build());

        // 14. Service Requests
        serviceRequestRepository.save(ServiceRequest.builder()
                .student(student)
                .requestType("BONAFIDE")
                .department("Academic Affairs")
                .description("Requesting Bonafide certificate for passport application.")
                .status("RESOLVED")
                .resolutionRemarks("Certificate issued and signed by Dean.")
                .createdAt(LocalDateTime.now().minusDays(5))
                .resolvedAt(LocalDateTime.now().minusDays(3))
                .build());

        serviceRequestRepository.save(ServiceRequest.builder()
                .student(student)
                .requestType("LIBRARY")
                .department("Central Library")
                .description("Requesting extended access to IEEE Digital Library & journal access.")
                .status("IN_REVIEW")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());

        log.info("Demo database initialization completed successfully!");
        ensureDemoParentAccount();
    }

    private void ensureDemoParentAccount() {
        Institution institution = institutionRepository.findByCode("NEC").orElse(null);
        String parentEmail = "parent@college.edu";

        // 1. Ensure Parent User account exists
        if (!userRepository.existsByEmail(parentEmail)) {
            userRepository.save(User.builder()
                    .institutionId(institution != null ? institution.getId() : "default-inst")
                    .email(parentEmail)
                    .username(parentEmail)
                    .passwordHash(passwordEncoder.encode("Parent@123"))
                    .role(Role.ROLE_PARENT)
                    .status("ACTIVE")
                    .build());
            log.info("Created demo parent account (parent@college.edu / Parent@123)");
        }

        // 2. Ensure Primary Ward (22CS001) is linked
        StudentProfile primaryWard = studentProfileRepository.findByRollNo("22CS001").orElse(null);
        if (primaryWard != null && (primaryWard.getGuardianEmail() == null || primaryWard.getGuardianEmail().isBlank())) {
            primaryWard.setGuardianEmail(parentEmail);
            primaryWard.setGuardianName("Srinivasa Rao Burri");
            primaryWard.setGuardianPhone("+91 98765 00000");
            studentProfileRepository.save(primaryWard);
        }

        // 3. Ensure Second Ward (24CS042 - Ananya Burri, 1st Year) exists for multi-ward switching
        if (institution != null && studentProfileRepository.findByRollNo("24CS042").isEmpty()) {
            User studentUser2 = User.builder()
                    .institutionId(institution.getId())
                    .email("ananya.burri@college.edu")
                    .username("24CS042")
                    .passwordHash(passwordEncoder.encode("Password@123"))
                    .role(Role.ROLE_STUDENT)
                    .status("ACTIVE")
                    .build();
            studentUser2 = userRepository.save(studentUser2);

            StudentProfile ward2 = StudentProfile.builder()
                    .user(studentUser2)
                    .institutionId(institution.getId())
                    .rollNo("24CS042")
                    .regNo("248N1A0542")
                    .firstName("Ananya")
                    .lastName("Burri")
                    .department("Computer Science & Engineering")
                    .program("B.Tech")
                    .currentYear(1)
                    .currentSemester(2)
                    .section("CSE-A")
                    .phone("+91 98765 43211")
                    .cgpa(new BigDecimal("9.10"))
                    .guardianName("Srinivasa Rao Burri")
                    .guardianPhone("+91 98765 00000")
                    .guardianEmail(parentEmail)
                    .profilePhotoUrl("")
                    .build();
            ward2 = studentProfileRepository.save(ward2);

            // Seed fee record for ward 2
            feeRecordRepository.save(FeeRecord.builder()
                    .student(ward2)
                    .category("Tuition Fee - Year 1")
                    .amount(new BigDecimal("75000.00"))
                    .dueDate(LocalDate.now().plusMonths(2))
                    .status("PAID")
                    .receiptNo("REC-2026-1101")
                    .paidAt(LocalDateTime.now().minusMonths(2))
                    .build());

            feeRecordRepository.save(FeeRecord.builder()
                    .student(ward2)
                    .category("Library & Laboratory Fee")
                    .amount(new BigDecimal("6000.00"))
                    .dueDate(LocalDate.now().plusDays(15))
                    .status("DUE")
                    .build());

            // Seed sample result for semester 1
            List<Subject> subjects = subjectRepository.findByInstitutionIdAndDepartmentAndSemester(
                    institution.getId(), "Computer Science & Engineering", 5);
            if (!subjects.isEmpty()) {
                Subject s1 = subjects.get(0);
                examResultRepository.save(ExamResult.builder()
                        .student(ward2)
                        .subject(s1)
                        .semester(1)
                        .internalMarks(new BigDecimal("29.00"))
                        .externalMarks(new BigDecimal("65.00"))
                        .totalMarks(new BigDecimal("94.00"))
                        .grade("O")
                        .credits(4)
                        .isPublished(true)
                        .examSession("Semester 1 Regular 2024-2025")
                        .build());
            }

            log.info("Created second linked ward (24CS042 - Ananya Burri) for multi-ward testing.");
        }
    }

    private void ensureDemoAssignmentCoverage() {
        StudentProfile demoStudent = studentProfileRepository.findByRollNo("22CS001").orElse(null);
        Institution institution = institutionRepository.findByCode("NEC").orElse(null);
        if (demoStudent == null || institution == null) return;

        List<Subject> subjects = subjectRepository.findByInstitutionIdAndDepartmentAndSemester(
                institution.getId(), demoStudent.getDepartment(), demoStudent.getCurrentSemester());
        Subject mathematics = subjects.stream().filter(subject -> "CS507".equals(subject.getCode())).findFirst().orElse(null);
        if (mathematics == null) {
            mathematics = subjectRepository.save(Subject.builder()
                    .institutionId(institution.getId()).code("CS507").name("Mathematics")
                    .credits(3).semester(demoStudent.getCurrentSemester()).department(demoStudent.getDepartment())
                    .facultyName("Prof. T. Lakshmi").icon("📊").build());
            subjects.add(mathematics);
        }
        if (subjects.stream().noneMatch(subject -> "CS508".equals(subject.getCode()))) {
            subjects.add(subjectRepository.save(Subject.builder()
                    .institutionId(institution.getId()).code("CS508").name("Computer Organization and Architecture")
                    .credits(4).semester(demoStudent.getCurrentSemester()).department(demoStudent.getDepartment())
                    .facultyName("Prof. V. Kiran").icon("🖥️").build()));
        }

        for (Subject subject : subjects) {
            if (!assignmentRepository.findBySubjectOrderByDueDateDesc(subject).isEmpty()) continue;
            String title;
            String description;
            switch (subject.getCode()) {
                case "CS501" -> { title = "SQL Complex Queries & Indexing"; description = "Write complex nested SQL queries and an index performance report."; }
                case "CS502" -> { title = "Responsive Portfolio Website"; description = "Build a modern personal portfolio using React and responsive CSS."; }
                case "CS503" -> { title = "Graph Traversal Algorithms"; description = "Implement BFS, DFS, and Dijkstra shortest path algorithms."; }
                case "CS504" -> { title = "Network Protocol Analysis"; description = "Analyze TCP/IP protocol behavior and document a packet trace."; }
                case "CS505" -> { title = "CPU Scheduling Algorithms"; description = "Compare scheduling strategies and implement Round Robin in Java."; }
                case "CS506" -> { title = "Software Requirements Specification"; description = "Prepare an SRS with functional requirements and use case diagrams."; }
                case "CS507" -> { title = "Applied Mathematics Problem Set"; description = "Solve problems on probability and numerical methods."; }
                default -> { continue; }
            }
            assignmentRepository.save(Assignment.builder().subject(subject).title(title).description(description)
                    .dueDate(LocalDateTime.now().plusDays(3 + subjects.indexOf(subject) * 2)).maxMarks(50).build());
        }
    }
}
