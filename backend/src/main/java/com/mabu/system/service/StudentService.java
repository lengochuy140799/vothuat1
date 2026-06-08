package com.mabu.system.service;

import com.mabu.system.dto.StudentDTO;
import com.mabu.system.entity.Student;
import com.mabu.system.entity.Tuition;
import com.mabu.system.exception.ResourceNotFoundException;
import com.mabu.system.mapper.StudentMapper;
import com.mabu.system.entity.Registration;
import com.mabu.system.repository.RegistrationRepository;
import com.mabu.system.repository.StudentRepository;
import com.mabu.system.repository.TuitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final TuitionRepository tuitionRepository;
    private final RegistrationRepository registrationRepository;
    private final StudentMapper studentMapper;

    @Transactional(readOnly = true)
    public List<StudentDTO> getStudentsByMonth(String month) {
        return registrationRepository.findByMonthWithDetails(month).stream()
                .map(Registration::getStudent)
                .map(studentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAllByOrderByIdDesc().stream()
                .map(studentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với mã: " + id));
        return studentMapper.toDTO(student);
    }

    @Transactional
    public StudentDTO saveStudent(StudentDTO dto) {
        return saveStudent(dto, null);
    }

    @Transactional
    public StudentDTO saveStudent(StudentDTO dto, String month) {
        Student student = studentRepository.findById(dto.getId())
                .orElseGet(() -> studentMapper.toEntity(dto));
        
        student.setName(dto.getName());
        student.setGender(dto.getGender());
        student.setBirth(dto.getBirth());
        student.setPhone(dto.getPhone());
        student.setCurrentBelt(dto.getCurrentBelt());
        student.setRegistrationDate(dto.getRegistrationDate());
        student.setAddress(dto.getAddress());
        
        Student saved = studentRepository.save(student);

        if (month != null && !month.trim().isEmpty()) {
            if (!registrationRepository.existsByStudentIdAndMonth(saved.getId(), month)) {
                String regId = "REG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Registration reg = Registration.builder()
                        .id(regId)
                        .student(saved)
                        .month(month)
                        .currentBelt(saved.getCurrentBelt())
                        .targetBelt(saved.getCurrentBelt())
                        .examFee(BigDecimal.ZERO)
                        .paymentStatus("UNPAID")
                        .notes("Đăng ký đóng học phí tháng " + month)
                        .build();
                registrationRepository.save(reg);
            }
        }
        
        return studentMapper.toDTO(saved);
    }

    @Transactional
    public StudentDTO updateStudent(String id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên với mã: " + id));
        
        student.setName(dto.getName());
        student.setGender(dto.getGender());
        student.setBirth(dto.getBirth());
        student.setPhone(dto.getPhone());
        student.setCurrentBelt(dto.getCurrentBelt());
        student.setRegistrationDate(dto.getRegistrationDate());
        student.setAddress(dto.getAddress());
        
        Student updated = studentRepository.save(student);
        return studentMapper.toDTO(updated);
    }

    @Transactional
    public void deleteStudent(String id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy học viên với mã: " + id);
        }
        studentRepository.deleteById(id);
    }

    @Transactional
    public List<StudentDTO> bulkImportStudents(List<StudentDTO> dtos) {
        List<Student> entities = dtos.stream()
                .map(dto -> {
                    // Overwrite if exists, otherwise create new
                    Student student = studentMapper.toEntity(dto);
                    return student;
                })
                .collect(Collectors.toList());
        List<Student> saved = studentRepository.saveAll(entities);
        return saved.stream().map(studentMapper::toDTO).collect(Collectors.toList());
    }
}
