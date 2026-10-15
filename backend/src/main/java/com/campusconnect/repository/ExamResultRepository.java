package com.campusconnect.repository;

import com.campusconnect.model.ExamResult;
import com.campusconnect.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, String> {
    List<ExamResult> findByStudentAndIsPublishedTrueOrderBySemesterDesc(StudentProfile student);
    List<ExamResult> findByStudentAndSemesterAndIsPublishedTrue(StudentProfile student, Integer semester);
}
