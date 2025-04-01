package com.serhat.expenseTracker.service.transaction;



import com.serhat.expenseTracker.dto.objects.SummaryDto;
import com.serhat.expenseTracker.dto.objects.TransactionDto;
import com.serhat.expenseTracker.dto.requests.TransactionRequest;
import com.serhat.expenseTracker.dto.requests.UpdateTransactionRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    String deleteTransaction(Long transactionId);
    TransactionDto updateTransaction(UpdateTransactionRequest request);
    TransactionDto createTransaction(TransactionRequest transactionRequest);
    TransactionDto findTransactionById(Long transactionId);
    SummaryDto getSummaryByYearAndMonth(int year, int month);
    SummaryDto getSummaryByYear(int year);
    List<TransactionDto> getRecurringTransactions();
    List<TransactionDto> findTransactionsByFilters(
            Integer year,
            Integer month,
            Category category,
            Status status,
            Currency currency,
            LocalDate date
    );
}