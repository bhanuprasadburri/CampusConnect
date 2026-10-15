package com.campusconnect.service;

import com.campusconnect.dto.AttendanceRecordDto;
import com.campusconnect.dto.AttendanceSummaryDto;
import com.campusconnect.dto.SubjectAttendanceDto;
import com.campusconnect.model.AttendanceRecord;
import com.campusconnect.model.AttendanceStatus;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.model.Subject;
import com.campusconnect.repository.AttendanceRecordRepository;
import com.campusconnect.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public AttendanceSummaryDto getAttendanceSummary(StudentProfile student) {
        List<Subject> subjects = subjectRepository.findByInstitutionIdAndDepartmentAndSemester(
                student.getInstitutionId(), student.getDepartment(), student.getCurrentSemester());

        List<SubjectAttendanceDto> subjectAttendanceList = new ArrayList<>();
        long totalConducted = 0;
        long totalAttended = 0;

        for (Subject subject : subjects) {
            long conducted = attendanceRecordRepository.countByStudentAndSubject(student, subject);
            long attended = attendanceRecordRepository.countByStudentAndSubjectAndStatus(student, subject, AttendanceStatus.PRESENT);

            totalConducted += conducted;
            totalAttended += attended;

            BigDecimal pct = conducted > 0
                    ? BigDecimal.valueOf(attended * 100.0 / conducted).setScale(1, RoundingMode.HALF_UP)
                    : BigDecimal.valueOf(100.0);

            subjectAttendanceList.add(SubjectAttendanceDto.builder()
                    .subjectId(subject.getId())
                    .subjectCode(subject.getCode())
                    .subjectName(subject.getName())
                    .totalConducted(conducted)
                    .totalAttended(attended)
                    .percentage(pct)
                    .status(pct.compareTo(BigDecimal.valueOf(75.0)) >= 0 ? "On track" : "Shortage (< 75%)")
                    .build());
        }

        long totalMissed = totalConducted - totalAttended;
        BigDecimal overallPct = totalConducted > 0
                ? BigDecimal.valueOf(totalAttended * 100.0 / totalConducted).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.valueOf(92.0);

        return AttendanceSummaryDto.builder()
                .overallPercentage(overallPct)
                .totalConducted(totalConducted)
                .totalAttended(totalAttended)
                .totalMissed(Math.max(0, totalMissed))
                .monthlyPercentage(BigDecimal.valueOf(96.0))
                .requirementNote("Requirement: 75% minimum as per academic regulations")
                .subjectAttendance(subjectAttendanceList)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getAttendanceHistory(StudentProfile student) {
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentOrderBySessionDateDescPeriodNumberAsc(student);
        return records.stream().map(r -> AttendanceRecordDto.builder()
                .id(r.getId())
                .subjectCode(r.getSubject().getCode())
                .subjectName(r.getSubject().getName())
                .sessionDate(r.getSessionDate())
                .periodNumber(r.getPeriodNumber())
                .status(r.getStatus().name())
                .remarks(r.getRemarks())
                .build()).collect(Collectors.toList());
    }
}
