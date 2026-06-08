package com.mabu.system.controller;

import com.mabu.system.entity.TuitionMonth;
import com.mabu.system.repository.TuitionMonthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tuition-months")
@RequiredArgsConstructor
@CrossOrigin
public class TuitionMonthController {

    private final TuitionMonthRepository tuitionMonthRepository;

    @GetMapping
    public ResponseEntity<List<TuitionMonth>> getAllMonths() {
        return ResponseEntity.ok(tuitionMonthRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<TuitionMonth> createMonth(@RequestBody TuitionMonth tuitionMonth) {
        if (tuitionMonth.getMonth() == null || tuitionMonth.getMonth().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        tuitionMonth.setMonth(tuitionMonth.getMonth().trim());
        TuitionMonth saved = tuitionMonthRepository.save(tuitionMonth);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
