package com.campusconnect.repository;

import com.campusconnect.model.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, String> {
    List<TimetableSlot> findByInstitutionIdAndDepartmentAndSemesterAndSectionOrderByDayOfWeekAscStartTimeAsc(
            String institutionId, String department, Integer semester, String section);
    List<TimetableSlot> findByDepartmentAndSemesterAndSection(
            String department, Integer semester, String section);
}
