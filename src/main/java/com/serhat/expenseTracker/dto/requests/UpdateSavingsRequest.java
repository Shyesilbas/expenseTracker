package com.serhat.expenseTracker.dto.requests;

import com.serhat.expenseTracker.entity.enums.Currency;

import java.math.BigDecimal;

public record UpdateSavingsRequest(
        Long id,
        BigDecimal amount
) {
}
