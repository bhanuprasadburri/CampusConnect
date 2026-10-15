package com.campusconnect.repository;

import com.campusconnect.model.AttendanceRecord;
import com.campusconnect.model.StudentProfile;
import com.campusconnect.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByStudentOrderBySessionDateDescPeriodNumberAsc(StudentProfile student);
    List<AttendanceRecord> findByStudentAndSubject(StudentProfile student, Subject subject);
    List<AttendanceRecord> findByStudentAndSessionDateBetween(StudentProfile student, LocalDate startDate, LocalDate endDate);
    long countByStudent(StudentProfile student);
    long countByStudentAndSubject(StudentProfile student, Subject subject);
    long countByStudentAndSubjectAndStatus(StudentProfile student, Subject subject, com.campusconnect.model.AttendanceStatus status);
}
