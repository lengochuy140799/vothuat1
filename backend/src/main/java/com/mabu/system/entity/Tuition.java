package com.mabu.system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tuitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tuition {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 20)
    private String month; // e.g., "06/2026"

    @Column(nullable = false, length = 20)
    private String status; // 'Đã đóng' | 'Chưa đóng'

    @Column(nullable = false)
    private BigDecimal fee;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
