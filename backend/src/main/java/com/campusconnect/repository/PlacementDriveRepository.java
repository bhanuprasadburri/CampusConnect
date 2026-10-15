package com.campusconnect.repository;

import com.campusconnect.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, String> {
    List<PlacementDrive> findByInstitutionIdOrderByDeadlineAsc(String institutionId);
    List<PlacementDrive> findByStatusOrderByDeadlineAsc(String status);
}
