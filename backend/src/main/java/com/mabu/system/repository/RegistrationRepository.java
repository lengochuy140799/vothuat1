package com.mabu.system.repository;

import com.mabu.system.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, String> {
    
    @Query("SELECT r FROM Registration r JOIN FETCH r.student LEFT JOIN FETCH r.examSession ORDER BY r.createdAt DESC")
    List<Registration> findAllWithDetails();

    @Query("SELECT r FROM Registration r JOIN FETCH r.student LEFT JOIN FETCH r.examSession WHERE r.examSession.id = :sessionId ORDER BY r.createdAt DESC")
    List<Registration> findBySessionIdWithDetails(@Param("sessionId") String sessionId);

    @Query("SELECT r FROM Registration r JOIN FETCH r.student LEFT JOIN FETCH r.examSession WHERE r.month = :month ORDER BY r.createdAt DESC")
    List<Registration> findByMonthWithDetails(@Param("month") String month);

    boolean existsByStudentIdAndExamSessionId(String studentId, String examSessionId);

    boolean existsByStudentIdAndMonth(String studentId, String month);
}
