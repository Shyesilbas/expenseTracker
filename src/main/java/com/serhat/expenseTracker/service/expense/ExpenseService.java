package com.serhat.expenseTracker.service.expense;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseService {
    ExpenseDto createExpense(ExpenseRequest expenseRequest);
    ExpenseDto findExpenseById(Long expenseId);
    List<ExpenseDto> findExpensesByCategory(Category category);
    List<ExpenseDto> findExpensesByStatus(Status status);
    List<ExpenseDto> findExpensesByCurrency(Currency currency);
    List<ExpenseDto> findByDate(LocalDate date);
}
