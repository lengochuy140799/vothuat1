package com.mabu.system.controller;

import com.mabu.system.dto.StudentDTO;
import com.mabu.system.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@CrossOrigin
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{monthPart1}/{monthPart2}")
    public ResponseEntity<List<StudentDTO>> getStudentsByMonth(@PathVariable String monthPart1, @PathVariable String monthPart2) {
        String month = monthPart1 + "/" + monthPart2;
        return ResponseEntity.ok(studentService.getStudentsByMonth(month));
    }

    @GetMapping("/by-month/{month:.+}")
    public ResponseEntity<List<StudentDTO>> getStudentsByMonthOld(@PathVariable String month) {
        return ResponseEntity.ok(studentService.getStudentsByMonth(month));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(
            @Valid @RequestBody StudentDTO dto,
            @RequestParam(required = false) String month) {
        return new ResponseEntity<>(studentService.saveStudent(dto, month), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable String id, @Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(studentService.updateStudent(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<List<StudentDTO>> bulkImport(@RequestBody List<StudentDTO> dtos) {
        return ResponseEntity.ok(studentService.bulkImportStudents(dtos));
    }
}
