package com.serhat.expenseTracker.dto.objects;


import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.entity.enums.TransactionType;


import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionDto(
        Long transactionId,
        BigDecimal amount,
        Currency currency,
        LocalDate date,
        Category category,
        Status status,
        String description,
        TransactionType type,
        Integer dayOfMonth ,
        Integer startMonth,
        Integer startYear,
        Integer endMonth,
        Integer endYear,
        String recurringSeriesId
)  {
}
