package com.serhat.expenseTracker.entity;

import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "saving_goals")
public class SavingGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "goal_amount", nullable = false)
    private BigDecimal goalAmount;

    @Column(name = "currency", nullable = false)
    @Enumerated(EnumType.STRING)
    private Currency currency;

    @Column(name = "initial_amount")
    private BigDecimal initialAmount;

    @Column(name = "description")
    private String description;

    @Column(name = "goal_name")
    private String goalName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "goal_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private GoalStatus goalStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;


    @PrePersist
    void initGoal(){
        this.startDate=LocalDate.now();
        this.goalStatus=GoalStatus.ACTIVE;
    }

}