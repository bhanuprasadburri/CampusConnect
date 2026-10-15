package com.campusconnect.service;

import com.campusconnect.dto.ExamResultDto;
import com.campusconnect.dto.SemesterResultDto;
import com.campusconnect.dto.TimetableSlotDto;
import com.campusconnect.model.ExamResult;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.model.Subject;
import com.campusconnect.model.TimetableSlot;
import com.campusconnect.repository.ExamResultRepository;
import com.campusconnect.repository.SubjectRepository;
import com.campusconnect.repository.TimetableSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicService {

    private final ExamResultRepository examResultRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<SemesterResultDto> getPublishedResults(StudentProfile student) {
        List<ExamResult> results = examResultRepository.findByStudentAndIsPublishedTrueOrderBySemesterDesc(student);
        Map<Integer, List<ExamResult>> semMap = results.stream()
                .collect(Collectors.groupingBy(ExamResult::getSemester));

        List<SemesterResultDto> list = new ArrayList<>();
        for (Map.Entry<Integer, List<ExamResult>> entry : semMap.entrySet()) {
            Integer sem = entry.getKey();
            List<ExamResult> semResults = entry.getValue();

            int totalCredits = semResults.stream().mapToInt(ExamResult::getCredits).sum();
            double weightedPoints = 0;
            for (ExamResult r : semResults) {
                double gradePoint = switch (r.getGrade()) {
                    case "O", "A+" -> 10.0;
                    case "A" -> 9.0;
                    case "B+" -> 8.0;
                    case "B" -> 7.0;
                    case "C" -> 6.0;
                    default -> 5.0;
                };
                weightedPoints += gradePoint * r.getCredits();
            }

            BigDecimal sgpa = totalCredits > 0
                    ? BigDecimal.valueOf(weightedPoints / totalCredits).setScale(2, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.valueOf(8.20);

            List<ExamResultDto> dtos = semResults.stream().map(r -> ExamResultDto.builder()
                    .id(r.getId())
                    .subjectCode(r.getSubject().getCode())
                    .subjectName(r.getSubject().getName())
                    .semester(r.getSemester())
                    .internalMarks(r.getInternalMarks())
                    .externalMarks(r.getExternalMarks())
                    .totalMarks(r.getTotalMarks())
                    .grade(r.getGrade())
                    .credits(r.getCredits())
                    .examSession(r.getExamSession())
                    .build()).collect(Collectors.toList());

            list.add(SemesterResultDto.builder()
                    .semester(sem)
                    .semesterName("Semester " + sem)
                    .sgpa(sgpa)
                    .totalCredits(totalCredits)
                    .resultStatus("PASSED")
                    .subjects(dtos)
                    .build());
        }

        list.sort(Comparator.comparing(SemesterResultDto::getSemester));
        return list;
    }

    @Transactional(readOnly = true)
    public List<TimetableSlotDto> getTimetable(StudentProfile student) {
        List<TimetableSlot> slots = timetableSlotRepository
                .findByInstitutionIdAndDepartmentAndSemesterAndSectionOrderByDayOfWeekAscStartTimeAsc(
                        student.getInstitutionId(), student.getDepartment(), student.getCurrentSemester(), student.getSection());

        return slots.stream().map(s -> TimetableSlotDto.builder()
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
    }

    @Transactional(readOnly = true)
    public List<Subject> getEnrolledCourses(StudentProfile student) {
        return subjectRepository.findByInstitutionIdAndDepartmentAndSemester(
                student.getInstitutionId(), student.getDepartment(), student.getCurrentSemester());
    }
}
