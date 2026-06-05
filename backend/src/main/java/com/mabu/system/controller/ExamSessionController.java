package com.mabu.system.controller;

import com.mabu.system.dto.ExamSessionDTO;
import com.mabu.system.service.ExamSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin
public class ExamSessionController {

    private final ExamSessionService examSessionService;

    @GetMapping
    public ResponseEntity<List<ExamSessionDTO>> getAllSessions() {
        return ResponseEntity.ok(examSessionService.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamSessionDTO> getSessionById(@PathVariable String id) {
        return ResponseEntity.ok(examSessionService.getSessionById(id));
    }

    @PostMapping
    public ResponseEntity<ExamSessionDTO> createSession(@Valid @RequestBody ExamSessionDTO dto) {
        return new ResponseEntity<>(examSessionService.saveSession(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamSessionDTO> updateSession(@PathVariable String id, @Valid @RequestBody ExamSessionDTO dto) {
        return ResponseEntity.ok(examSessionService.updateSession(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable String id) {
        examSessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
