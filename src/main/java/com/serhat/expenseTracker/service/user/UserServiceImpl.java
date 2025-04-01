package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Transaction;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.mapper.UserMapper;
import com.serhat.expenseTracker.repository.TransactionRepository;
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
    private final TransactionRepository transactionRepository;

    @Override
    public UserDto userInfo() {
        AppUser user = getCurrentUser();
        return new UserDto(
                user.getUsername(),
                user.getEmail(),
                user.getFavoriteCurrency()
        );
    }

    @Override
    public Currency setfavoriteCurrency(Currency currency) {
        AppUser user = getCurrentUser();
        user.setFavoriteCurrency(currency);
        userRepository.save(user);
        return user.getFavoriteCurrency();
    }

    @Override
    public BigDecimal getBudgetStatusByYearAndMonth(int year, int month) {
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

    public BigDecimal getAnnualIncome(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return getIncomeBetweenDates(startDate, endDate);
    }

    public BigDecimal getAnnualOutgoings(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return getOutgoingsBetweenDates(startDate, endDate);
    }

    public BigDecimal getAnnualBudget(int year) {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalOutgoings = BigDecimal.ZERO;
        for (int month = 1; month <= 12; month++) {
            totalIncome = totalIncome.add(getIncomeByYearAndMonth(year, month));
            totalOutgoings = totalOutgoings.add(getOutgoingsByYearAndMonth(year, month));
        }
        return totalIncome.subtract(totalOutgoings);
    }

    private BigDecimal getIncomeBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(getCurrentUser(), startDate, endDate);
        return transactions.stream()
                .filter(expense -> expense.getStatus() == Status.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getOutgoingsBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(getCurrentUser(), startDate, endDate);
        return transactions.stream()
                .filter(expense -> expense.getStatus() != Status.INCOME)
                .map(Transaction::getAmount)
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