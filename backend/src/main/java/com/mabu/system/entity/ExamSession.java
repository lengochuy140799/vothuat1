package com.mabu.system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamSession {

    @Id
    @Column(length = 50)
    private String id; // e.g., "EX-2026-Q2"

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String date;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false, length = 20)
    private String status; // 'OPEN' | 'CLOSED'

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
