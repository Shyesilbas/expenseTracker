package com.serhat.expenseTracker.mapper;

import com.serhat.expenseTracker.dto.objects.TransactionDto;
import com.serhat.expenseTracker.dto.requests.TransactionRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Transaction;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.TransactionType;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

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

    public Transaction toTransaction(TransactionRequest request, AppUser user) {
        Currency selectedCurrency = user.getFavoriteCurrency() != null ? user.getFavoriteCurrency() : request.currency();
        return Transaction.builder()
                .amount(request.amount())
                .description(request.description())
                .category(request.category())
                .date(request.date() != null ? request.date() : LocalDate.now())
                .status(request.status())
                .currency(selectedCurrency)
                .user(user)
                .type(TransactionType.ONE_TIME)
                .build();
    }
}