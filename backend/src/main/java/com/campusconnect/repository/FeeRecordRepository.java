package com.campusconnect.repository;

import com.campusconnect.model.FeeRecord;
import com.campusconnect.model.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRecordRepository extends JpaRepository<FeeRecord, String> {
    List<FeeRecord> findByStudentOrderByDueDateAsc(StudentProfile student);
}
