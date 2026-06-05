package com.mabu.system.controller;

import com.mabu.system.dto.RegistrationDTO;
import com.mabu.system.dto.RegistrationUpdateNotesDTO;
import com.mabu.system.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
@CrossOrigin
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping
    public ResponseEntity<List<RegistrationDTO>> getAllRegistrations(@RequestParam(required = false) String sessionId) {
        if (sessionId != null) {
            return ResponseEntity.ok(registrationService.getRegistrationsBySession(sessionId));
        }
        return ResponseEntity.ok(registrationService.getAllRegistrations());
    }

    @PostMapping
    public ResponseEntity<RegistrationDTO> createRegistration(@Valid @RequestBody RegistrationDTO dto) {
        return new ResponseEntity<>(registrationService.saveRegistration(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/toggle-payment")
    public ResponseEntity<RegistrationDTO> togglePayment(@PathVariable String id) {
        return ResponseEntity.ok(registrationService.togglePayment(id));
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<RegistrationDTO> updateNotes(@PathVariable String id, @RequestBody RegistrationUpdateNotesDTO dto) {
        return ResponseEntity.ok(registrationService.updateNotes(id, dto.getNotes()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistration(@PathVariable String id) {
        registrationService.deleteRegistration(id);
        return ResponseEntity.noContent().build();
    }
}
