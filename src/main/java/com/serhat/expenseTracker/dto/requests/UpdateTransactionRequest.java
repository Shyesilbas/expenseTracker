package com.serhat.expenseTracker.dto.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateTransactionRequest(
        Long id,
        BigDecimal amount,
        Currency currency,
        String description,
        Status status,
        Category category,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
        LocalDate date
) {
}
