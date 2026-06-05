package com.mabu.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamSessionDTO {

    @NotBlank(message = "Mã kỳ thi không được để trống")
    private String id;

    @NotBlank(message = "Tên kỳ thi không được để trống")
    private String name;

    @NotBlank(message = "Ngày thi không được để trống")
    private String date;

    @NotBlank(message = "Địa điểm không được để trống")
    private String location;

    @NotBlank(message = "Trạng thái không được để trống")
    @Pattern(regexp = "OPEN|CLOSED", message = "Trạng thái chỉ có thể là OPEN hoặc CLOSED")
    private String status;

    private String createdAt;
}
