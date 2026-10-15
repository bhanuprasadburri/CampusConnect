package com.campusconnect.repository;

import com.campusconnect.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, String> {
    List<Subject> findByInstitutionIdAndDepartmentAndSemester(String institutionId, String department, Integer semester);
    List<Subject> findByDepartmentAndSemester(String department, Integer semester);
}
