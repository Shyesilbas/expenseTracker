package com.serhat.expenseTracker.controller;

import com.serhat.expenseTracker.dto.objects.SummaryDto;
import com.serhat.expenseTracker.dto.objects.TransactionDto;
import com.serhat.expenseTracker.dto.requests.RecurringTransactionRequest;
import com.serhat.expenseTracker.dto.requests.RecurringTransactionUpdateRequest;
import com.serhat.expenseTracker.dto.requests.TransactionRequest;
import com.serhat.expenseTracker.dto.requests.UpdateTransactionRequest;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.service.transaction.TransactionService;
import com.serhat.expenseTracker.service.transaction.recurring.RecurringTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final RecurringTransactionService recurringTransactionService;

    @PostMapping("/create/one-time")
    public ResponseEntity<TransactionDto> createExpense(@RequestBody TransactionRequest expenseRequest) {
        TransactionDto createdExpense = transactionService.createTransaction(expenseRequest);
        return ResponseEntity.ok(createdExpense);
    }

    @PostMapping("/create/recurring")
    public ResponseEntity<TransactionDto> createExpense(@RequestBody RecurringTransactionRequest request) {
        TransactionDto createdExpense = recurringTransactionService.createRecurringTransaction(request);
        return ResponseEntity.ok(createdExpense);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<TransactionDto> getExpenseById(@PathVariable Long expenseId) {
        TransactionDto expense = transactionService.findTransactionById(expenseId);
        return ResponseEntity.ok(expense);
    }

    @GetMapping("/recurring")
    public ResponseEntity<List<TransactionDto>> getRecurringTransactions() {
        return ResponseEntity.ok(recurringTransactionService.getRecurringTransactions());
    }

    @DeleteMapping("/delete/{transactionId}")
    public ResponseEntity<String> deleteExpense(@PathVariable Long transactionId) {
        return ResponseEntity.ok(transactionService.deleteTransaction(transactionId));
    }

    @DeleteMapping("/delete/recurring-series/{transactionId}")
    public ResponseEntity<String> deleteRecurringSeries(@PathVariable Long transactionId) {
        return ResponseEntity.ok(recurringTransactionService.deleteRecurringSeries(transactionId));
    }

    /*
    @DeleteMapping("/delete/recurring-single/{transactionId}")
    public ResponseEntity<String> deleteSingleRecurringTransaction(@PathVariable Long transactionId) {
        return ResponseEntity.ok(recurringTransactionService.deleteSingleRecurringTransaction(transactionId));
    }

     */

    @PutMapping("/update/one-time/{transactionId}")
    public ResponseEntity<TransactionDto> updateExpense(
            @PathVariable Long transactionId,
            @RequestBody UpdateTransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(transactionId, request));
    }

    @PutMapping("/update/recurring/{transactionId}")
    public ResponseEntity<TransactionDto> updateRecurringExpense(
            @PathVariable Long transactionId,
            @RequestBody RecurringTransactionUpdateRequest request) {
        return ResponseEntity.ok(recurringTransactionService.updateRecurringTransaction(transactionId, request));
    }

    @GetMapping("/monthly-summary/{year}/{month}")
    public ResponseEntity<SummaryDto> summaryByYearAndMonth(@PathVariable int year, @PathVariable int month) {
        return ResponseEntity.ok(transactionService.getSummaryByYearAndMonth(year, month));
    }

    @GetMapping("/annual-summary/{year}")
    public ResponseEntity<SummaryDto> getAnnualSummary(@PathVariable int year) {
        return ResponseEntity.ok(transactionService.getSummaryByYear(year));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<TransactionDto>> getExpensesByFilters(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Currency currency,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<TransactionDto> expenses = transactionService.findTransactionsByFilters(year, month, category, status, currency, date);
        return ResponseEntity.ok(expenses);
    }
}