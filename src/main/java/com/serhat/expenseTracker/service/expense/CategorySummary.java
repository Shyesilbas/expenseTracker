package com.serhat.expenseTracker.service.expense;

import com.serhat.expenseTracker.entity.enums.Status;

public record CategorySummary(
        long transactionCount, double totalAmount, Status status
) {
}
