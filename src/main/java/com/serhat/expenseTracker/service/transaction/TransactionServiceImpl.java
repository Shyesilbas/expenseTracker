package com.serhat.expenseTracker.service.transaction;

import com.serhat.expenseTracker.dto.objects.CategoryExpensesDto;
import com.serhat.expenseTracker.dto.objects.SummaryDto;
import com.serhat.expenseTracker.dto.objects.TransactionDto;
import com.serhat.expenseTracker.dto.requests.TransactionRequest;
import com.serhat.expenseTracker.dto.requests.UpdateTransactionRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Transaction;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.exception.ExpenseNotFoundException;
import com.serhat.expenseTracker.mapper.TransactionMapper;
import com.serhat.expenseTracker.repository.TransactionRepository;
import com.serhat.expenseTracker.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final UserService userService;

    private AppUser currentUser() {
        return userService.getCurrentUser();
    }

    private List<Transaction> findExpensesByDateRange(AppUser user, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserAndDateBetween(user, startDate, endDate);
    }

    private List<Transaction> filterExpenses(List<Transaction> expenses, Category category, Status status, Currency currency, LocalDate date) {
        return expenses.stream()
                .filter(expense -> category == null || expense.getCategory() == category)
                .filter(expense -> status == null || expense.getStatus() == status)
                .filter(expense -> currency == null || expense.getCurrency() == currency)
                .filter(expense -> date == null || expense.getDate().equals(date))
                .toList();
    }


    @Override
    public String deleteTransaction(Long transactionId) {
        AppUser user = currentUser();
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found by id: " + transactionId));

        transactionRepository.delete(transaction);
        return "Expense deleted successfully.";
    }

    @Override
    public TransactionDto updateTransaction(UpdateTransactionRequest request) {
        if (request.id() == null) {
            throw new IllegalArgumentException("Expense ID cannot be null");
        }

        AppUser user = currentUser();
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, request.id())
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found by id: " + request.id()));

        if (request.amount() != null) {
            transaction.setAmount(request.amount());
        }
        if (request.currency() != null) {
            transaction.setCurrency(request.currency());
        }
        if (request.description() != null) {
            transaction.setDescription(request.description());
        }
        if (request.status() != null) {
            transaction.setStatus(request.status());
        }
        if (request.category() != null) {
            transaction.setCategory(request.category());
        }
        if (request.date() != null) {
            transaction.setDate(request.date());
        }

        transactionRepository.save(transaction);
        return transactionMapper.toTransactionDto(transaction);
    }

    @Override
    public TransactionDto createTransaction(TransactionRequest expenseRequest) {
        AppUser user = currentUser();
        Currency selectedCurrency = user.getFavoriteCurrency() != null ? user.getFavoriteCurrency() : expenseRequest.currency();

        Transaction transaction = Transaction.builder()
                .amount(expenseRequest.amount())
                .description(expenseRequest.description())
                .category(expenseRequest.category())
                .date(expenseRequest.date())
                .status(expenseRequest.status())
                .currency(selectedCurrency)
                .user(user)
                .build();

        transactionRepository.save(transaction);
        return transactionMapper.toTransactionDto(transaction);
    }

    @Override
    public TransactionDto findTransactionById(Long transactionId) {
        AppUser user = currentUser();
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for user with id: " + transactionId));

        return transactionMapper.toTransactionDto(transaction);
    }

    @Override
    public SummaryDto getSummaryByYearAndMonth(int year, int month) {
        AppUser user = currentUser();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Transaction> expenses = findExpensesByDateRange(user, startDate, endDate);
        BigDecimal totalIncome = userService.getIncomeByYearAndMonth(year, month);
        BigDecimal totalOutgoings = userService.getOutgoingsByYearAndMonth(year, month);
        BigDecimal totalBudget = userService.getBudgetStatusByYearAndMonth(year, month);

        Map<Category, List<CategoryExpensesDto>> groupedExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.collectingAndThen(
                                Collectors.groupingBy(Transaction::getStatus, Collectors.toList()),
                                statusMap -> statusMap.values().stream()
                                        .filter(list -> !list.isEmpty())
                                        .map(list -> new CategoryExpensesDto(
                                                list.size(),
                                                list.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                                                list.getFirst().getStatus()
                                        ))
                                        .toList()
                        )
                ));

        return new SummaryDto(totalIncome, totalOutgoings, totalBudget, groupedExpenses);
    }



    @Override
    public SummaryDto getSummaryByYear(int year) {
        AppUser user = currentUser();
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        List<Transaction> transactions = findExpensesByDateRange(user, startDate, endDate);

        BigDecimal totalIncome = userService.getAnnualIncome(year);
        BigDecimal totalOutgoings = userService.getAnnualOutgoings(year);
        BigDecimal totalBudget = userService.getAnnualBudget(year);

        Map<Category, List<CategoryExpensesDto>> groupedExpenses = transactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.collectingAndThen(
                                Collectors.groupingBy(Transaction::getStatus, Collectors.toList()),
                                statusMap -> statusMap.values().stream()
                                        .filter(list -> !list.isEmpty())
                                        .map(list -> new CategoryExpensesDto(
                                                list.size(),
                                                list.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                                                list.getFirst().getStatus()
                                        ))
                                        .toList()
                        )
                ));

        return new SummaryDto(totalIncome, totalOutgoings, totalBudget, groupedExpenses);
    }


    @Override
    public List<TransactionDto> findTransactionsByFilters(
            Integer year,
            Integer month,
            Category category,
            Status status,
            Currency currency,
            LocalDate date
    ) {
        AppUser user = currentUser();

        LocalDate startDate;
        LocalDate endDate;

        if (year != null && month != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else if (year != null) {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        } else {
            startDate = LocalDate.of(1970, 1, 1);
            endDate = LocalDate.now();
        }

        List<Transaction> transactions = findExpensesByDateRange(user, startDate, endDate);
        transactions = filterExpenses(transactions, category, status, currency, date);

        return transactions.stream().map(transactionMapper::toTransactionDto).toList();
    }
}
