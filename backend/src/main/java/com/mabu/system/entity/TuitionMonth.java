package com.mabu.system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tuition_months")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuitionMonth {

    @Id
    @Column(nullable = false, length = 20)
    private String month;
}
