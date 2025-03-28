package com.serhat.expenseTracker.service.expense;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.dto.requests.ExpenseRequest;
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

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Collections;
import java.util.List;

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

    @Override
    public List<ExpenseDto> getExpenses() {
        AppUser user = currentUser();
        List<Expense> userExpenses = expenseRepository.findByUser(user);
        return userExpenses.isEmpty() ? Collections.emptyList() :
                userExpenses.stream().map(expenseMapper::toExpenseDto).toList();
    }

    @Override
    public List<ExpenseDto> findExpensesByMonth(int year, int month) {
        AppUser user = currentUser();
        LocalDate startDate = YearMonth.of(year, month).atDay(1);
        LocalDate endDate = YearMonth.of(year, month).atEndOfMonth();

        return expenseRepository.findByUserAndDateBetween(user, startDate, endDate)
                .stream()
                .map(expenseMapper::toExpenseDto)
                .toList();
    }

    @Override
    public List<ExpenseDto> findExpensesByYear(int year) {
        AppUser user = currentUser();
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        return expenseRepository.findByUserAndDateBetween(user, startDate, endDate)
                .stream()
                .map(expenseMapper::toExpenseDto)
                .toList();
    }

    @Override
    public ExpenseDto createExpense(ExpenseRequest expenseRequest) {
        AppUser user = currentUser();
        Expense expense = Expense.builder()
                .amount(expenseRequest.amount())
                .description(expenseRequest.description())
                .category(expenseRequest.category())
                .date(expenseRequest.date())
                .paymentMethod(expenseRequest.paymentMethod())
                .status(expenseRequest.status())
                .currency(expenseRequest.currency())
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
    public List<ExpenseDto> findExpensesByCategory(Category category) {
        AppUser user = currentUser();
        return expenseRepository.findExpensesByUserAndCategory(user, category)
                .stream()
                .map(expenseMapper::toExpenseDto)
                .toList();
    }

    @Override
    public List<ExpenseDto> findExpensesByStatus(Status status) {
        AppUser user = currentUser();
        return expenseRepository.findExpensesByUserAndStatus(user, status)
                .stream()
                .map(expenseMapper::toExpenseDto)
                .toList();
    }

    @Override
    public List<ExpenseDto> findExpensesByCurrency(Currency currency) {
        AppUser user = currentUser();
        return expenseRepository.findExpensesByUserAndCurrency(user, currency)
                .stream()
                .map(expenseMapper::toExpenseDto)
                .toList();
    }

    @Override
    public List<ExpenseDto> findByDate(LocalDate date) {
        AppUser user = currentUser();
        return expenseRepository.findExpensesByUserAndDate(user, date)
                .stream()
                .map(expenseMapper::toExpenseDto)
                .toList();
    }
}
