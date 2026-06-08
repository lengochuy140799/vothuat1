package com.mabu.system.service;

import com.mabu.system.dto.TuitionDTO;
import com.mabu.system.entity.Student;
import com.mabu.system.entity.Tuition;
import com.mabu.system.exception.ResourceNotFoundException;
import com.mabu.system.entity.TuitionMonth;
import com.mabu.system.mapper.TuitionMapper;
import com.mabu.system.repository.StudentRepository;
import com.mabu.system.repository.TuitionMonthRepository;
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
    private final TuitionMonthRepository tuitionMonthRepository;
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
                .orElseGet(() -> {
                    Student stub = Student.builder()
                            .id(dto.getStudentId())
                            .name("Học viên mới")
                            .gender("Nam")
                            .birth("2012-01-01")
                            .phone("0901234567")
                            .currentBelt("Trắng")
                            .registrationDate("2026-06-05")
                            .build();
                    return studentRepository.save(stub);
                });

        if (!tuitionMonthRepository.existsById(dto.getMonth())) {
            tuitionMonthRepository.save(TuitionMonth.builder().month(dto.getMonth()).build());
        }

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
        Optional<Tuition> optTuition = tuitionRepository.findById(id);
        if (optTuition.isEmpty() && dto.getStudentId() != null && dto.getMonth() != null) {
            optTuition = tuitionRepository.findByStudentIdAndMonth(dto.getStudentId(), dto.getMonth());
        }

        Tuition tuition;
        if (optTuition.isPresent()) {
            tuition = optTuition.get();
            tuition.setStatus(dto.getStatus());
            tuition.setFee(dto.getFee());
            if (dto.getIsDeleted() != null) {
                tuition.setIsDeleted(dto.getIsDeleted());
            }
        } else {
            String studentId = dto.getStudentId();
            String month = dto.getMonth();
            if (studentId == null || month == null) {
                // Return gracefully or throw if studentId and month are missing
                throw new ResourceNotFoundException("Không tìm thấy học phí với mã: " + id);
            }

            Student student = studentRepository.findById(studentId)
                    .orElseGet(() -> {
                        Student stub = Student.builder()
                                .id(studentId)
                                .name("Học viên mới")
                                .gender("Nam")
                                .birth("2012-01-01")
                                .phone("0901234567")
                                .currentBelt("Trắng")
                                .registrationDate("2026-06-05")
                                .build();
                        return studentRepository.save(stub);
                    });

            if (!tuitionMonthRepository.existsById(month)) {
                tuitionMonthRepository.save(TuitionMonth.builder().month(month).build());
            }

            tuition = tuitionMapper.toEntity(dto);
            tuition.setId(id);
            tuition.setStudent(student);
            tuition.setIsDeleted(false);
        }

        Tuition saved = tuitionRepository.save(tuition);
        return tuitionMapper.toDTO(saved);
    }

    @Transactional
    public void deleteTuition(String id) {
        Optional<Tuition> optTuition = tuitionRepository.findById(id);
        if (optTuition.isPresent()) {
            Tuition tuition = optTuition.get();
            tuition.setIsDeleted(true);
            tuitionRepository.save(tuition);
            return;
        }

        // If not found in DB, try parsing the ID to construct a soft-deleted stub to match frontend behavior
        if (id != null && id.startsWith("TUI-") && id.length() >= 11) {
            String cleanMonth = id.substring(4, 10); // e.g. "022026"
            String month = cleanMonth.substring(0, 2) + "/" + cleanMonth.substring(2); // e.g. "02/2026"
            String studentIdSuffix = id.substring(11); // e.g. "VS2026-003" / "VS2026-002"

            Optional<Student> studentOpt = studentRepository.findById(studentIdSuffix);
            if (studentOpt.isEmpty()) {
                List<Student> students = studentRepository.findAll();
                studentOpt = students.stream()
                        .filter(s -> s.getId().replace("-", "").equalsIgnoreCase(studentIdSuffix) 
                                  || s.getId().equalsIgnoreCase(studentIdSuffix))
                        .findFirst();
            }

            if (studentOpt.isPresent()) {
                if (!tuitionMonthRepository.existsById(month)) {
                    tuitionMonthRepository.save(TuitionMonth.builder().month(month).build());
                }

                Tuition tuition = Tuition.builder()
                        .id(id)
                        .student(studentOpt.get())
                        .month(month)
                        .status("Chưa đóng")
                        .fee(BigDecimal.valueOf(400000))
                        .isDeleted(true)
                        .build();
                tuitionRepository.save(tuition);
            }
        }
    }

    @Transactional
    public List<TuitionDTO> clonePreviousMonth(String currentMonth, String prevMonth) {
        if (!tuitionMonthRepository.existsById(currentMonth)) {
            tuitionMonthRepository.save(TuitionMonth.builder().month(currentMonth).build());
        }

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
