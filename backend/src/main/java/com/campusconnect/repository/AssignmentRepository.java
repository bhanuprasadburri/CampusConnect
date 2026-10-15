package com.campusconnect.repository;

import com.campusconnect.model.Assignment;
import com.campusconnect.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    List<Assignment> findBySubjectInOrderByDueDateDesc(List<Subject> subjects);
    List<Assignment> findBySubjectOrderByDueDateDesc(Subject subject);
}
