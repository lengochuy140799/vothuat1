package com.mabu.system.repository;

import com.mabu.system.entity.ExamSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamSessionRepository extends JpaRepository<ExamSession, String> {
    List<ExamSession> findAllByOrderByDateDesc();
}
