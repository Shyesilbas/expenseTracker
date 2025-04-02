package com.serhat.expenseTracker.dto.requests;

import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;

import java.math.BigDecimal;

public record RecurringTransactionUpdateRequest(
        BigDecimal amount,
        String description,
        Category category,
        Status status,
        Currency currency,
        Integer startMonth,
        Integer startYear,
        Integer endMonth,
        Integer endYear,
        Integer dayOfMonth
) {
}
