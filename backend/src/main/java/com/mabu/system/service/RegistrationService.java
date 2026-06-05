package com.mabu.system.service;

import com.mabu.system.dto.RegistrationDTO;
import com.mabu.system.entity.ExamSession;
import com.mabu.system.entity.Registration;
import com.mabu.system.entity.Student;
import com.mabu.system.exception.ResourceNotFoundException;
import com.mabu.system.mapper.RegistrationMapper;
import com.mabu.system.repository.ExamSessionRepository;
import com.mabu.system.repository.RegistrationRepository;
import com.mabu.system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final StudentRepository studentRepository;
    private final ExamSessionRepository examSessionRepository;
    private final RegistrationMapper registrationMapper;

    @Transactional(readOnly = true)
    public List<RegistrationDTO> getAllRegistrations() {
        return registrationRepository.findAllWithDetails().stream()
                .map(registrationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistrationDTO> getRegistrationsBySession(String sessionId) {
        return registrationRepository.findBySessionIdWithDetails(sessionId).stream()
                .map(registrationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public RegistrationDTO saveRegistration(RegistrationDTO dto) {
        if (registrationRepository.existsById(dto.getId())) {
            throw new IllegalArgumentException("Mã đăng ký '" + dto.getId() + "' đã tồn tại!");
        }

        if (registrationRepository.existsByStudentIdAndExamSessionId(dto.getStudentId(), dto.getExamSessionId())) {
            throw new IllegalArgumentException("Võ sinh này đã có hồ sơ đăng ký dự thi trong kỳ này rồi!");
        }

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với mã: " + dto.getStudentId()));

        ExamSession examSession = examSessionRepository.findById(dto.getExamSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ thi với mã: " + dto.getExamSessionId()));

        Registration registration = registrationMapper.toEntity(dto);
        registration.setStudent(student);
        registration.setExamSession(examSession);

        Registration saved = registrationRepository.save(registration);
        return registrationMapper.toDTO(saved);
    }

    @Transactional
    public RegistrationDTO togglePayment(String id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký thi với mã: " + id));

        if ("PAID".equals(registration.getPaymentStatus())) {
            registration.setPaymentStatus("UNPAID");
            registration.setPaymentDate(null);
        } else {
            registration.setPaymentStatus("PAID");
            registration.setPaymentDate(LocalDate.now().toString());
        }

        Registration updated = registrationRepository.save(registration);
        return registrationMapper.toDTO(updated);
    }

    @Transactional
    public RegistrationDTO updateNotes(String id, String notes) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đăng ký thi với mã: " + id));

        registration.setNotes(notes);
        Registration updated = registrationRepository.save(registration);
        return registrationMapper.toDTO(updated);
    }

    @Transactional
    public void deleteRegistration(String id) {
        if (!registrationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy đăng ký thi với mã: " + id);
        }
        registrationRepository.deleteById(id);
    }
}
