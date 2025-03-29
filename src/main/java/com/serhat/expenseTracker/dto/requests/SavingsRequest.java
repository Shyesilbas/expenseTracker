package com.serhat.expenseTracker.dto.requests;

import com.serhat.expenseTracker.entity.enums.Currency;

import java.math.BigDecimal;

public record SavingsRequest(
        Currency currency,
        BigDecimal amount
) {
}
