package com.serhat.expenseTracker.controller;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
import com.serhat.expenseTracker.dto.requests.UpdateExpenseRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.service.expense.CategorySummary;
import com.serhat.expenseTracker.service.expense.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseDto> getExpenseById(@PathVariable Long expenseId) {
        ExpenseDto expense = expenseService.findExpenseById(expenseId);
        return ResponseEntity.ok(expense);
    }

    @DeleteMapping("/delete/{expenseId}")
    public ResponseEntity<String> deleteExpense(@PathVariable Long expenseId) {
        return ResponseEntity.ok(expenseService.deleteExpense(expenseId));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(
            @PathVariable Long id,
            @RequestBody UpdateExpenseRequest request) {
        if (!id.equals(request.id())) {
            throw new IllegalArgumentException("Path variable ID must match request body ID");
        }
        return ResponseEntity.ok(expenseService.updateExpense(request));
    }


    @GetMapping("/current-month-category-summary")
    public ResponseEntity<Map<Category, CategorySummary>> getCurrentMonthCategorySummary() {
        Map<Category, CategorySummary> summary = expenseService.getCurrentMonthCategorySummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/current-year-category-summary")
    public ResponseEntity<Map<Category, CategorySummary>> getCurrentYearCategorySummary() {
        Map<Category, CategorySummary> summary = expenseService.getCurrentYearCategorySummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ExpenseDto>> getExpensesByFilters(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Currency currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<ExpenseDto> expenses = expenseService.findExpensesByFilters(year, month, category, status, currency, date);
        return ResponseEntity.ok(expenses);
    }
}