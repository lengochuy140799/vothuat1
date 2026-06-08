package com.mabu.system.controller;

import com.mabu.system.entity.TuitionMonth;
import com.mabu.system.repository.RegistrationRepository;
import com.mabu.system.repository.TuitionMonthRepository;
import com.mabu.system.repository.TuitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tuition-months")
@RequiredArgsConstructor
@CrossOrigin
public class TuitionMonthController {

    private final TuitionMonthRepository tuitionMonthRepository;
    private final TuitionRepository tuitionRepository;
    private final RegistrationRepository registrationRepository;

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

    @DeleteMapping("/{monthPart1}/{monthPart2}")
    @Transactional
    public ResponseEntity<Void> deleteMonth(@PathVariable String monthPart1, @PathVariable String monthPart2) {
        String month = monthPart1 + "/" + monthPart2;
        tuitionRepository.deleteByMonth(month);
        registrationRepository.deleteByMonth(month);
        tuitionMonthRepository.deleteById(month);
        return ResponseEntity.noContent().build();
    }
}
