package com.serhat.expenseTracker.service.expense;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ExpenseService {
    ExpenseDto createExpense(ExpenseRequest expenseRequest);
    ExpenseDto findExpenseById(Long expenseId);
    List<ExpenseDto> getExpenses();
    List<ExpenseDto> findExpensesByCategory(Category category);
    List<ExpenseDto> findExpensesByStatus(Status status);
    List<ExpenseDto> findExpensesByCurrency(Currency currency);
    List<ExpenseDto> findByDate(LocalDate date);
    List<ExpenseDto> findExpensesByMonth(int year, int month);
    List<ExpenseDto> findExpensesByYear(int year);
    Map<Category, CategorySummary> getCurrentMonthCategorySummary();
    Map<Category, CategorySummary> getCurrentYearCategorySummary();
}
