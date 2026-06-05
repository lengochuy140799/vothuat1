package com.mabu.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuitionDTO {

    private String id;

    @NotBlank(message = "Mã học viên không được để trống")
    private String studentId;

    @NotBlank(message = "Tháng học phí không được để trống")
    private String month;

    @NotBlank(message = "Trạng thái học phí không được để trống")
    private String status;

    @NotNull(message = "Học phí không được để trống")
    private BigDecimal fee;

    private Boolean isDeleted;

    private String createdAt;
}
