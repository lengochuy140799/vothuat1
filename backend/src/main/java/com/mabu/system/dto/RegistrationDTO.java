package com.mabu.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationDTO {

    @NotBlank(message = "Mã đăng ký không được để trống")
    private String id;

    @NotBlank(message = "Mã học viên không được để trống")
    private String studentId;

    private String examSessionId;

    private String month;

    @NotBlank(message = "Cấp đai hiện tại không được để trống")
    private String currentBelt;

    @NotBlank(message = "Cấp đai mục tiêu không được để trống")
    private String targetBelt;

    @NotNull(message = "Lệ phí thi không được để trống")
    private BigDecimal examFee;

    @NotBlank(message = "Trạng thái thanh toán không được để trống")
    @Pattern(regexp = "PAID|UNPAID", message = "Trạng thái thanh toán phải là PAID hoặc UNPAID")
    private String paymentStatus;

    private String paymentDate;

    private String notes;

    private String createdAt;
}
