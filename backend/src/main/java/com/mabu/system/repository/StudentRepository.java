package com.mabu.system.repository;

import com.mabu.system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, String> {
    List<Student> findAllByOrderByIdDesc();
}
