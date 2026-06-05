package com.mabu.system.service;

import com.mabu.system.dto.ExamSessionDTO;
import com.mabu.system.entity.ExamSession;
import com.mabu.system.exception.ResourceNotFoundException;
import com.mabu.system.mapper.ExamSessionMapper;
import com.mabu.system.repository.ExamSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamSessionService {

    private final ExamSessionRepository examSessionRepository;
    private final ExamSessionMapper examSessionMapper;

    @Transactional(readOnly = true)
    public List<ExamSessionDTO> getAllSessions() {
        return examSessionRepository.findAllByOrderByDateDesc().stream()
                .map(examSessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamSessionDTO getSessionById(String id) {
        ExamSession session = examSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ thi với mã: " + id));
        return examSessionMapper.toDTO(session);
    }

    @Transactional
    public ExamSessionDTO saveSession(ExamSessionDTO dto) {
        if (examSessionRepository.existsById(dto.getId())) {
            throw new IllegalArgumentException("Mã kỳ thi '" + dto.getId() + "' đã tồn tại!");
        }
        ExamSession session = examSessionMapper.toEntity(dto);
        ExamSession saved = examSessionRepository.save(session);
        return examSessionMapper.toDTO(saved);
    }

    @Transactional
    public ExamSessionDTO updateSession(String id, ExamSessionDTO dto) {
        ExamSession session = examSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kỳ thi với mã: " + id));
        
        session.setName(dto.getName());
        session.setDate(dto.getDate());
        session.setLocation(dto.getLocation());
        session.setStatus(dto.getStatus());
        
        ExamSession updated = examSessionRepository.save(session);
        return examSessionMapper.toDTO(updated);
    }

    @Transactional
    public void deleteSession(String id) {
        if (!examSessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy kỳ thi với mã: " + id);
        }
        examSessionRepository.deleteById(id);
    }
}
