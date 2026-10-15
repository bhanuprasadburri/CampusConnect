package com.campusconnect.repository;

import com.campusconnect.model.StudentProfile;
import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, String> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(String userId);
    Optional<StudentProfile> findByRollNo(String rollNo);
    List<StudentProfile> findByGuardianEmailIgnoreCaseAndInstitutionId(String guardianEmail, String institutionId);
}
