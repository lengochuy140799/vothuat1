package com.mabu.system.mapper;

import com.mabu.system.dto.StudentDTO;
import com.mabu.system.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface StudentMapper {
    StudentMapper INSTANCE = Mappers.getMapper(StudentMapper.class);

    @Mapping(target = "createdAt", expression = "java(student.getCreatedAt() != null ? student.getCreatedAt().toString() : null)")
    StudentDTO toDTO(Student student);

    @Mapping(target = "createdAt", ignore = true)
    Student toEntity(StudentDTO dto);
}
