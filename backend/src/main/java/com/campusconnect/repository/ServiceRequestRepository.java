package com.campusconnect.repository;

import com.campusconnect.model.ServiceRequest;
import com.campusconnect.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, String> {
    List<ServiceRequest> findByStudentOrderByCreatedAtDesc(StudentProfile student);
}
