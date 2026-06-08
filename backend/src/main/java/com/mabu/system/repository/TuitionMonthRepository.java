package com.mabu.system.repository;

import com.mabu.system.entity.TuitionMonth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TuitionMonthRepository extends JpaRepository<TuitionMonth, String> {
}
