package com.mabu.system.mapper;

import com.mabu.system.dto.ExamSessionDTO;
import com.mabu.system.entity.ExamSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ExamSessionMapper {
    ExamSessionMapper INSTANCE = Mappers.getMapper(ExamSessionMapper.class);

    @Mapping(target = "createdAt", expression = "java(session.getCreatedAt() != null ? session.getCreatedAt().toString() : null)")
    ExamSessionDTO toDTO(ExamSession session);

    @Mapping(target = "createdAt", ignore = true)
    ExamSession toEntity(ExamSessionDTO dto);
}
