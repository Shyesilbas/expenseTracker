package com.serhat.expenseTracker.dto.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.expenseTracker.entity.enums.Currency;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SavingGoalRequest(
        BigDecimal goalAmount,
        Currency currency,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
        LocalDate targetDate,
        BigDecimal initialAmount,
        String description,
        String goalName
) {
}