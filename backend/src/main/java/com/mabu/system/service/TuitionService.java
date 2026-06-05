package com.mabu.system.service;

import com.mabu.system.dto.TuitionDTO;
import com.mabu.system.entity.Student;
import com.mabu.system.entity.Tuition;
import com.mabu.system.exception.ResourceNotFoundException;
import com.mabu.system.mapper.TuitionMapper;
import com.mabu.system.repository.StudentRepository;
import com.mabu.system.repository.TuitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TuitionService {

    private final TuitionRepository tuitionRepository;
    private final StudentRepository studentRepository;
    private final TuitionMapper tuitionMapper;

    @Transactional(readOnly = true)
    public List<TuitionDTO> getAllActiveTuitions() {
        return tuitionRepository.findAllActive().stream()
                .map(tuitionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TuitionDTO> getTuitionsByMonth(String month) {
        return tuitionRepository.findByMonthActive(month).stream()
                .map(tuitionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TuitionDTO saveTuition(TuitionDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với mã: " + dto.getStudentId()));

        Optional<Tuition> existing = tuitionRepository.findByStudentIdAndMonth(dto.getStudentId(), dto.getMonth());
        Tuition tuition;
        if (existing.isPresent()) {
            tuition = existing.get();
            tuition.setStatus(dto.getStatus());
            tuition.setFee(dto.getFee());
            tuition.setIsDeleted(false); // Reactivate if was soft deleted
        } else {
            tuition = tuitionMapper.toEntity(dto);
            if (dto.getId() == null || dto.getId().isEmpty()) {
                tuition.setId("TUI-" + dto.getMonth().replace("/", "") + "-" + dto.getStudentId().replace("-", ""));
            }
            tuition.setStudent(student);
            tuition.setIsDeleted(false);
        }

        Tuition saved = tuitionRepository.save(tuition);
        return tuitionMapper.toDTO(saved);
    }

    @Transactional
    public TuitionDTO updateTuition(String id, TuitionDTO dto) {
        Tuition tuition = tuitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học phí với mã: " + id));

        tuition.setStatus(dto.getStatus());
        tuition.setFee(dto.getFee());
        if (dto.getIsDeleted() != null) {
            tuition.setIsDeleted(dto.getIsDeleted());
        }

        Tuition saved = tuitionRepository.save(tuition);
        return tuitionMapper.toDTO(saved);
    }

    @Transactional
    public void deleteTuition(String id) {
        Tuition tuition = tuitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học phí với mã: " + id));
        
        // Use soft delete to match frontend behavior
        tuition.setIsDeleted(true);
        tuitionRepository.save(tuition);
    }

    @Transactional
    public List<TuitionDTO> clonePreviousMonth(String currentMonth, String prevMonth) {
        List<Tuition> prevTuitions = tuitionRepository.findByMonthActive(prevMonth);
        List<TuitionDTO> savedDtos = new ArrayList<>();

        for (Tuition prev : prevTuitions) {
            // Check if already exists in target month
            Optional<Tuition> existing = tuitionRepository.findByStudentIdAndMonth(prev.getStudent().getId(), currentMonth);
            if (existing.isEmpty()) {
                Tuition fresh = Tuition.builder()
                        .id("TUI-" + currentMonth.replace("/", "") + "-" + prev.getStudent().getId().replace("-", ""))
                        .student(prev.getStudent())
                        .month(currentMonth)
                        .status("Chưa đóng") // Reset payment status to Unpaid
                        .fee(prev.getFee())
                        .isDeleted(false)
                        .build();
                Tuition saved = tuitionRepository.save(fresh);
                savedDtos.add(tuitionMapper.toDTO(saved));
            }
        }
        return savedDtos;
    }
}
