package com.serhat.expenseTracker.service.transaction.recurring;

import com.serhat.expenseTracker.dto.objects.TransactionDto;
import com.serhat.expenseTracker.dto.requests.RecurringTransactionRequest;
import com.serhat.expenseTracker.dto.requests.RecurringTransactionUpdateRequest;

import java.util.List;

public interface RecurringTransactionService {
    TransactionDto createRecurringTransaction(RecurringTransactionRequest request);
    List<TransactionDto> getRecurringTransactions();
    String deleteRecurringSeries(Long transactionId);
    TransactionDto updateRecurringTransaction(Long transactionId, RecurringTransactionUpdateRequest request);
 //   String deleteSingleRecurringTransaction(Long transactionId);


}
