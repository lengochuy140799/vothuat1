package com.mabu.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDTO {

    @NotBlank(message = "Mã học viên không được để trống")
    private String id;

    @NotBlank(message = "Tên học viên không được để trống")
    private String name;

    @NotBlank(message = "Giới tính không được để trống")
    @Pattern(regexp = "Nam|Nữ", message = "Giới tính chỉ có thể là Nam hoặc Nữ")
    private String gender;

    @NotBlank(message = "Ngày sinh không được để trống")
    private String birth;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    @NotBlank(message = "Đai hiện tại không được để trống")
    @Pattern(regexp = "Trắng|Vàng|Xanh|Đỏ|Đen", message = "Đai màu không hợp lệ")
    private String currentBelt;

    @NotBlank(message = "Ngày nhập học không được để trống")
    private String registrationDate;

    private String address;

    private String createdAt;
}
