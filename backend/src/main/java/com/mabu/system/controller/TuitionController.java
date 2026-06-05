package com.mabu.system.controller;

import com.mabu.system.dto.TuitionDTO;
import com.mabu.system.service.TuitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/tuitions")
@RequiredArgsConstructor
@CrossOrigin
public class TuitionController {

    private final TuitionService tuitionService;

    @GetMapping
    public ResponseEntity<List<TuitionDTO>> getTuitions(@RequestParam(required = false) String month) {
        if (month != null && !month.trim().isEmpty()) {
            return ResponseEntity.ok(tuitionService.getTuitionsByMonth(month));
        }
        return ResponseEntity.ok(tuitionService.getAllActiveTuitions());
    }

    @PostMapping
    public ResponseEntity<TuitionDTO> createTuition(@Valid @RequestBody TuitionDTO dto) {
        return new ResponseEntity<>(tuitionService.saveTuition(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TuitionDTO> updateTuition(@PathVariable String id, @Valid @RequestBody TuitionDTO dto) {
        return ResponseEntity.ok(tuitionService.updateTuition(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTuition(@PathVariable String id) {
        tuitionService.deleteTuition(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clone")
    public ResponseEntity<List<TuitionDTO>> cloneMonth(
            @RequestParam String currentMonth,
            @RequestParam String prevMonth) {
        return ResponseEntity.ok(tuitionService.clonePreviousMonth(currentMonth, prevMonth));
    }
}
