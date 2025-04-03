package com.serhat.expenseTracker.dto.objects;

import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.GoalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingGoalDto(
        Long id,
        BigDecimal goalAmount,
        Currency currency,
        BigDecimal initialAmount,
        String description,
        String goalName,
        LocalDate startDate,
        LocalDate targetDate,
        GoalStatus goalStatus
) {
}
