package com.mabu.system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @Column(length = 50)
    private String id; // e.g., "HV-2026-001"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 10)
    private String gender; // 'Nam' | 'Nữ'

    @Column(nullable = false, length = 50)
    private String birth; // String-based of birth-date

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "current_belt", nullable = false, length = 20)
    private String currentBelt; // 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen'

    @Column(name = "registration_date", nullable = false, length = 50)
    private String registrationDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
