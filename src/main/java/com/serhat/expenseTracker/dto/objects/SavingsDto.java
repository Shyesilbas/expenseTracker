package com.serhat.expenseTracker.dto.objects;

import com.serhat.expenseTracker.entity.enums.Currency;

import java.math.BigDecimal;

public record SavingsDto(
        Long id,
        Currency currency,
        BigDecimal amount
) {
}
