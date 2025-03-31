package com.serhat.expenseTracker.dto.objects;

import com.serhat.expenseTracker.entity.enums.Status;

import java.math.BigDecimal;

public record CategoryExpensesDto(
         int transactionCount,
         BigDecimal totalAmount,
         Status status
) {
}
