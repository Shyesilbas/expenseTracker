package com.serhat.expenseTracker.service.expense;

public record CategorySummary(
        long transactionCount, double totalAmount
) {
}
