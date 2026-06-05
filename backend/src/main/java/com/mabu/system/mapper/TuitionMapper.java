package com.mabu.system.mapper;

import com.mabu.system.dto.TuitionDTO;
import com.mabu.system.entity.Tuition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface TuitionMapper {
    TuitionMapper INSTANCE = Mappers.getMapper(TuitionMapper.class);

    @Mapping(source = "student.id", target = "studentId")
    @Mapping(target = "createdAt", expression = "java(tuition.getCreatedAt() != null ? tuition.getCreatedAt().toString() : null)")
    TuitionDTO toDTO(Tuition tuition);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Tuition toEntity(TuitionDTO dto);
}
