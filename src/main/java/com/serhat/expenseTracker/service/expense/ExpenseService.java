package com.serhat.expenseTracker.service.expense;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
import com.serhat.expenseTracker.dto.requests.UpdateExpenseRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ExpenseService {
    ExpenseDto createExpense(ExpenseRequest expenseRequest);
    ExpenseDto findExpenseById(Long expenseId);

    ExpenseDto updateExpense(UpdateExpenseRequest request);

    List<ExpenseDto> findExpensesByFilters(
            Integer year,
            Integer month,
            Category category,
            Status status,
            Currency currency,
            LocalDate date
    );
    String deleteExpense(Long expenseId);

    Map<Category, CategorySummary> getCurrentMonthCategorySummary();
    Map<Category, CategorySummary> getCurrentYearCategorySummary();
}