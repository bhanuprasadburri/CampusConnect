package com.campusconnect.repository;

import com.campusconnect.model.Assignment;
import com.campusconnect.model.AssignmentSubmission;
import com.campusconnect.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, String> {
    List<AssignmentSubmission> findByStudent(StudentProfile student);
    Optional<AssignmentSubmission> findByAssignmentAndStudent(Assignment assignment, StudentProfile student);
}
