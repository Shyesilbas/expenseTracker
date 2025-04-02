package com.serhat.expenseTracker.dto.requests;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.entity.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        BigDecimal amount,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
        LocalDate date,
        Category category,
        Status status,
        TransactionType transactionType,
        String description,
        Currency currency
) {
}