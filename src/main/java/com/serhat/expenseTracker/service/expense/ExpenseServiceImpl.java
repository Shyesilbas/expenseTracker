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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseServiceImpl implements ExpenseService{
    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final UserService userService;

    private AppUser currentUser(){
        return userService.getCurrentUser();
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
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(()-> new ExpenseNotFoundException("Expense not found by id : "+expenseId));
        return expenseMapper.toExpenseDto(expense);
    }

    @Override
    public List<ExpenseDto> findExpensesByCategory(Category category) {
       AppUser user = currentUser();
       List<Expense> expensesByCategory = expenseRepository.findExpensesByUserAndCategory(user,category);
       return expensesByCategory.stream()
               .map(expenseMapper::toExpenseDto)
               .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDto> findExpensesByStatus(Status status) {
        AppUser user = currentUser();
        List<Expense> expensesByStatus = expenseRepository.findExpensesByUserAndStatus(user,status);
        return expensesByStatus.stream()
                .map(expenseMapper::toExpenseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDto> findExpensesByCurrency(Currency currency) {
        AppUser user = currentUser();
        List<Expense> expensesByCurrency = expenseRepository.findExpensesByUserAndCurrency(user,currency);
        return expensesByCurrency.stream()
                .map(expenseMapper::toExpenseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDto> findByDate(LocalDate date) {
        AppUser user = currentUser();
        List<Expense> expensesByCurrency = expenseRepository.findExpensesByUserAndDate(user,date);
        return expensesByCurrency.stream()
                .map(expenseMapper::toExpenseDto)
                .collect(Collectors.toList());
    }
}
