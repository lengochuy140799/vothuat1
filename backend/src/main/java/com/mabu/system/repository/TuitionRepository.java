package com.mabu.system.repository;

import com.mabu.system.entity.Tuition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface TuitionRepository extends JpaRepository<Tuition, String> {

    @Query("SELECT t FROM Tuition t JOIN FETCH t.student WHERE t.isDeleted = false ORDER BY t.createdAt DESC")
    List<Tuition> findAllActive();

    @Query("SELECT t FROM Tuition t JOIN FETCH t.student WHERE t.month = :month AND t.isDeleted = false ORDER BY t.createdAt DESC")
    List<Tuition> findByMonthActive(@Param("month") String month);

    @Query("SELECT t FROM Tuition t JOIN FETCH t.student WHERE t.month = :month")
    List<Tuition> findByMonth(@Param("month") String month);

    Optional<Tuition> findByStudentIdAndMonth(String studentId, String month);

    @Modifying
    @Transactional
    @Query("DELETE FROM Tuition t WHERE t.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") String studentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Tuition t WHERE t.month = :month")
    void deleteByMonth(@Param("month") String month);
}
