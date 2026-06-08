package com.mabu.system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registration {

    @Id
    @Column(length = 50)
    private String id; // e.g., "REG-001"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_session_id", nullable = true)
    private ExamSession examSession;

    @Column(name = "month", length = 20)
    private String month;

    @Column(name = "current_belt", nullable = false, length = 20)
    private String currentBelt;

    @Column(name = "target_belt", nullable = false, length = 20)
    private String targetBelt;

    @Column(name = "exam_fee", nullable = false)
    private BigDecimal examFee;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus; // 'PAID' | 'UNPAID'

    @Column(name = "payment_date", length = 50)
    private String paymentDate;

    @Column(length = 255)
    private String notes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
