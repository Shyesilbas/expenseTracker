package com.serhat.expenseTracker.controller;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.service.expense.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/create")
    public ResponseEntity<ExpenseDto> createExpense(@RequestBody ExpenseRequest expenseRequest) {
        ExpenseDto createdExpense = expenseService.createExpense(expenseRequest);
        return ResponseEntity.ok(createdExpense);
    }

    @GetMapping()
    public ResponseEntity<List<ExpenseDto>> getExpenses() {
        List<ExpenseDto> expense = expenseService.getExpenses();
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<ExpenseDto>> getMonthlyExpenses(
            @RequestParam int year,
            @RequestParam int month) {
        List<ExpenseDto> expenses = expenseService.findExpensesByMonth(year, month);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/yearly")
    public ResponseEntity<List<ExpenseDto>> getYearlyExpenses(@RequestParam int year) {
        List<ExpenseDto> expenses = expenseService.findExpensesByYear(year);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseDto> getExpenseById(@PathVariable Long expenseId) {
        ExpenseDto expense = expenseService.findExpenseById(expenseId);
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/category")
    public ResponseEntity<List<ExpenseDto>> getExpensesByCategory(@RequestParam Category category) {
        List<ExpenseDto> expenses = expenseService.findExpensesByCategory(category);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/status")
    public ResponseEntity<List<ExpenseDto>> getExpensesByStatus(@RequestParam Status status) {
        List<ExpenseDto> expenses = expenseService.findExpensesByStatus(status);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/currency")
    public ResponseEntity<List<ExpenseDto>> getExpensesByCurrency(@RequestParam Currency currency) {
        List<ExpenseDto> expenses = expenseService.findExpensesByCurrency(currency);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/date")
    public ResponseEntity<List<ExpenseDto>> getExpensesByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ExpenseDto> expenses = expenseService.findByDate(date);
        return ResponseEntity.ok(expenses);
    }
}
