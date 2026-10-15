package com.campusconnect.repository;

import com.campusconnect.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, String> {
    
    @Query("SELECT n FROM Notice n WHERE n.institutionId = :institutionId " +
           "AND (n.targetDept IS NULL OR n.targetDept = :dept) " +
           "AND (n.targetYear IS NULL OR n.targetYear = :year) " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :now) " +
           "ORDER BY n.publishedAt DESC")
    List<Notice> findTargetedNotices(
            @Param("institutionId") String institutionId,
            @Param("dept") String dept,
            @Param("year") Integer year,
            @Param("now") LocalDateTime now);

    List<Notice> findByInstitutionIdOrderByPublishedAtDesc(String institutionId);
}
