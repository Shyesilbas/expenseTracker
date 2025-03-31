package com.serhat.expenseTracker.service.expense;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.objects.SummaryDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
import com.serhat.expenseTracker.dto.requests.UpdateExpenseRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ExpenseService {
    String deleteExpense(Long expenseId);
    ExpenseDto updateExpense(UpdateExpenseRequest request);
    ExpenseDto createExpense(ExpenseRequest expenseRequest);
    ExpenseDto findExpenseById(Long expenseId);
    SummaryDto getSummaryByYearAndMonth(int year, int month);
    SummaryDto getSummaryByYear(int year);
    List<ExpenseDto> findExpensesByFilters(
            Integer year,
            Integer month,
            Category category,
            Status status,
            Currency currency,
            LocalDate date
    );
}