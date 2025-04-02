package com.serhat.expenseTracker.mapper;

import com.serhat.expenseTracker.dto.objects.TransactionDto;
import com.serhat.expenseTracker.entity.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionDto toTransactionDto(Transaction expense) {
        return new TransactionDto(
                expense.getTransactionId(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getDate(),
                expense.getCategory(),
                expense.getStatus(),
                expense.getDescription(),
                expense.getType(),
                expense.getDayOfMonth(),
                expense.getStartMonth(),
                expense.getStartYear(),
                expense.getEndMonth(),
                expense.getEndYear(),
                expense.getRecurringSeriesId()
        );
    }
}