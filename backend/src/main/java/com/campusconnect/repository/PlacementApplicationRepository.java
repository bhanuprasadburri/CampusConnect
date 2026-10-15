package com.campusconnect.repository;

import com.campusconnect.model.PlacementApplication;
import com.campusconnect.model.PlacementDrive;
import com.campusconnect.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, String> {
    List<PlacementApplication> findByStudentOrderByAppliedAtDesc(StudentProfile student);
    Optional<PlacementApplication> findByDriveAndStudent(PlacementDrive drive, StudentProfile student);
    boolean existsByDriveAndStudent(PlacementDrive drive, StudentProfile student);
}
