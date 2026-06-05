package com.mabu.system.mapper;

import com.mabu.system.dto.RegistrationDTO;
import com.mabu.system.entity.Registration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface RegistrationMapper {
    RegistrationMapper INSTANCE = Mappers.getMapper(RegistrationMapper.class);

    @Mapping(source = "student.id", target = "studentId")
    @Mapping(source = "examSession.id", target = "examSessionId")
    @Mapping(target = "createdAt", expression = "java(registration.getCreatedAt() != null ? registration.getCreatedAt().toString() : null)")
    RegistrationDTO toDTO(Registration registration);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "examSession", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Registration toEntity(RegistrationDTO dto);
}
