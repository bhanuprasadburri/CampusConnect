package com.campusconnect.repository;

import com.campusconnect.model.Project;
import com.campusconnect.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findByStudentOrderByCreatedAtDesc(StudentProfile student);
    List<Project> findByInstitutionIdOrderByCreatedAtDesc(String institutionId);
}
