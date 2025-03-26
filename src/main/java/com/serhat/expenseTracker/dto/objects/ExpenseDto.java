package com.serhat.expenseTracker.dto.objects;

import java.math.BigDecimal;

public record ExpenseDto(
         BigDecimal amount,
         String date, // "dd-MM-yyyy"
         String category,
         Boolean isIncome,
         String paymentMethod,
         String note
) {
}
