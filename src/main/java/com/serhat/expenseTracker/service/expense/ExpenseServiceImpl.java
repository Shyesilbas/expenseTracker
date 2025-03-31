package com.serhat.expenseTracker.service.expense;

import com.serhat.expenseTracker.dto.objects.CategoryExpensesDto;
import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.objects.SummaryDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
import com.serhat.expenseTracker.dto.requests.UpdateExpenseRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Expense;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.exception.ExpenseNotFoundException;
import com.serhat.expenseTracker.mapper.ExpenseMapper;
import com.serhat.expenseTracker.repository.ExpenseRepository;
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
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final UserService userService;

    private AppUser currentUser() {
        return userService.getCurrentUser();
    }

    private List<Expense> findExpensesByDateRange(AppUser user, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserAndDateBetween(user, startDate, endDate);
    }

    private List<Expense> filterExpenses(List<Expense> expenses, Category category, Status status, Currency currency, LocalDate date) {
        return expenses.stream()
                .filter(expense -> category == null || expense.getCategory() == category)
                .filter(expense -> status == null || expense.getStatus() == status)
                .filter(expense -> currency == null || expense.getCurrency() == currency)
                .filter(expense -> date == null || expense.getDate().equals(date))
                .toList();
    }


    @Override
    public String deleteExpense(Long expenseId) {
        AppUser user = currentUser();
        Expense expense = expenseRepository.findByUserAndExpenseId(user, expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found by id: " + expenseId));

        expenseRepository.delete(expense);
        return "Expense deleted successfully.";
    }

    @Override
    public ExpenseDto updateExpense(UpdateExpenseRequest request) {
        if (request.id() == null) {
            throw new IllegalArgumentException("Expense ID cannot be null");
        }

        AppUser user = currentUser();
        Expense expense = expenseRepository.findByUserAndExpenseId(user, request.id())
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found by id: " + request.id()));

        if (request.amount() != null) {
            expense.setAmount(request.amount());
        }
        if (request.currency() != null) {
            expense.setCurrency(request.currency());
        }
        if (request.description() != null) {
            expense.setDescription(request.description());
        }
        if (request.status() != null) {
            expense.setStatus(request.status());
        }
        if (request.category() != null) {
            expense.setCategory(request.category());
        }
        if (request.date() != null) {
            expense.setDate(request.date());
        }

        expenseRepository.save(expense);
        return expenseMapper.toExpenseDto(expense);
    }

    @Override
    public ExpenseDto createExpense(ExpenseRequest expenseRequest) {
        AppUser user = currentUser();
        Currency selectedCurrency = user.getFavoriteCurrency() != null ? user.getFavoriteCurrency() : expenseRequest.currency();

        Expense expense = Expense.builder()
                .amount(expenseRequest.amount())
                .description(expenseRequest.description())
                .category(expenseRequest.category())
                .date(expenseRequest.date())
                .status(expenseRequest.status())
                .currency(selectedCurrency)
                .user(user)
                .build();

        expenseRepository.save(expense);
        return expenseMapper.toExpenseDto(expense);
    }

    @Override
    public ExpenseDto findExpenseById(Long expenseId) {
        AppUser user = currentUser();
        Expense expense = expenseRepository.findByUserAndExpenseId(user, expenseId)
                .orElseThrow(() -> new ExpenseNotFoundException("Expense not found for user with id: " + expenseId));

        return expenseMapper.toExpenseDto(expense);
    }

    @Override
    public SummaryDto getSummaryByYearAndMonth(int year, int month) {
        AppUser user = currentUser();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        List<Expense> expenses = findExpensesByDateRange(user, startDate, endDate);
        BigDecimal totalIncome = userService.getIncomeByYearAndMonth(year, month);
        BigDecimal totalOutgoings = userService.getOutgoingsByYearAndMonth(year, month);
        BigDecimal totalBudget = userService.getBudgetStatusByYearAndMonth(year, month);

        Map<Category, List<CategoryExpensesDto>> groupedExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.collectingAndThen(
                                Collectors.groupingBy(Expense::getStatus, Collectors.toList()),
                                statusMap -> statusMap.values().stream()
                                        .filter(list -> !list.isEmpty())
                                        .map(list -> new CategoryExpensesDto(
                                                list.size(),
                                                list.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
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

        List<Expense> expenses = findExpensesByDateRange(user, startDate, endDate);

        BigDecimal totalIncome = userService.getAnnualIncome(year);
        BigDecimal totalOutgoings = userService.getAnnualOutgoings(year);
        BigDecimal totalBudget = userService.getAnnualBudget(year);

        Map<Category, List<CategoryExpensesDto>> groupedExpenses = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.collectingAndThen(
                                Collectors.groupingBy(Expense::getStatus, Collectors.toList()),
                                statusMap -> statusMap.values().stream()
                                        .filter(list -> !list.isEmpty())
                                        .map(list -> new CategoryExpensesDto(
                                                list.size(),
                                                list.stream().map(Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add),
                                                list.getFirst().getStatus()
                                        ))
                                        .toList()
                        )
                ));

        return new SummaryDto(totalIncome, totalOutgoings, totalBudget, groupedExpenses);
    }


    @Override
    public List<ExpenseDto> findExpensesByFilters(
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

        List<Expense> expenses = findExpensesByDateRange(user, startDate, endDate);
        expenses = filterExpenses(expenses, category, status, currency, date);

        return expenses.stream().map(expenseMapper::toExpenseDto).toList();
    }
}
