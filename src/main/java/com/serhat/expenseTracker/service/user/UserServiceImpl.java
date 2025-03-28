package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Expense;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.mapper.UserMapper;
import com.serhat.expenseTracker.repository.ExpenseRepository;
import com.serhat.expenseTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserValidationService userValidationService;
    private final UserMapper userMapper;
    private final UserDetailsServiceImpl userDetailsService;
    private final ExpenseRepository expenseRepository;

    @Override
    public UserDto userInfo() {
        AppUser user = getCurrentUser();
        return new UserDto(
                user.getUsername(),
                user.getEmail()
        );
    }

    @Override
    public BigDecimal getMonthlyBudgetStatus() {
        return monthlyIncome().subtract(monthlyOutgoings());
    }

    @Override
    public BigDecimal monthlyIncome() { // current date
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        return getIncomeBetweenDates(startOfMonth, endOfMonth);
    }

    @Override
    public BigDecimal monthlyOutgoings() { // current date
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
        return getOutgoingsBetweenDates(startOfMonth, endOfMonth);
    }

    @Override
    public BigDecimal annualIncome() {
        LocalDate now = LocalDate.now();
        LocalDate startOfYear = now.withDayOfYear(1);
        LocalDate endOfYear = now.withMonth(12).withDayOfMonth(31);
        return getIncomeBetweenDates(startOfYear, endOfYear);
    }

    @Override
    public BigDecimal annualOutgoings() {
        LocalDate now = LocalDate.now();
        LocalDate startOfYear = now.withDayOfYear(1);
        LocalDate endOfYear = now.withMonth(12).withDayOfMonth(31);
        return getOutgoingsBetweenDates(startOfYear, endOfYear);
    }

    public BigDecimal annualBudget(){
        return annualIncome().subtract(annualOutgoings());
    }

    @Override
    public BigDecimal getBudgetStatusByYearAndMonth(int year, int month) { // for specific month and year
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        BigDecimal income = getIncomeBetweenDates(startDate, endDate);
        BigDecimal outgoings = getOutgoingsBetweenDates(startDate, endDate);
        return income.subtract(outgoings);
    }

    @Override
    public BigDecimal getIncomeByYearAndMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return getIncomeBetweenDates(startDate, endDate);
    }

    @Override
    public BigDecimal getOutgoingsByYearAndMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return getOutgoingsBetweenDates(startDate, endDate);
    }

    private BigDecimal getIncomeBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository.findExpensesByUserAndDateBetween(getCurrentUser(), startDate, endDate);
        return expenses.stream()
                .filter(expense -> expense.getStatus() == Status.INCOME)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getOutgoingsBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = expenseRepository.findExpensesByUserAndDateBetween(getCurrentUser(), startDate, endDate);
        return expenses.stream()
                .filter(expense -> expense.getStatus() != Status.INCOME)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("No authenticated user found");
    }

    @Override
    public void saveUser(AppUser user) {
        userRepository.save(user);
    }

    @Override
    public AppUser createUser(RegisterRequest request) {
        AppUser user = userMapper.toUser(request);
        saveUser(user);
        return user;
    }

    @Override
    public void validateRegistration(RegisterRequest request) {
        userValidationService.validateUserRegistration(request);
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userDetailsService.loadUserByUsername(username);
    }
}
