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
    private final CurrentUserHolder currentUserHolder;

    public AppUser getCurrentUser() {
        return currentUserHolder.getCurrentUser();
    }

    @Override
    public UserDto userInfo() {
        AppUser user = getCurrentUser();
        return new UserDto(user.getUsername(), user.getEmail(), user.getFavoriteCurrency());
    }

    @Override
    public Currency setFavoriteCurrency(Currency currency) {
        AppUser user = getCurrentUser();
        user.setFavoriteCurrency(currency);
        userRepository.save(user);
        return currency;
    }

    private List<Transaction> getTransactionsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserAndDateBetween(getCurrentUser(), startDate, endDate);
    }

    private BigDecimal calculateAmountByStatus(List<Transaction> transactions, Status status, boolean isIncome) {
        return transactions.stream()
                .filter(t -> isIncome ? t.getStatus() == status : t.getStatus() != status)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getIncomeBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionsBetweenDates(startDate, endDate);
        return calculateAmountByStatus(transactions, Status.INCOME, true);
    }

    private BigDecimal getOutgoingsBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionsBetweenDates(startDate, endDate);
        return calculateAmountByStatus(transactions, Status.INCOME, false);
    }

    private BigDecimal calculateBudget(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionsBetweenDates(startDate, endDate);
        BigDecimal income = calculateAmountByStatus(transactions, Status.INCOME, true);
        BigDecimal outgoings = calculateAmountByStatus(transactions, Status.INCOME, false);
        return income.subtract(outgoings);
    }

    @Override
    public BigDecimal getBudgetStatusByYearAndMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return calculateBudget(startDate, endDate);
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

    @Override
    public BigDecimal getAnnualIncome(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return getIncomeBetweenDates(startDate, endDate);
    }

    @Override
    public BigDecimal getAnnualOutgoings(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return getOutgoingsBetweenDates(startDate, endDate);
    }

    @Override
    public BigDecimal getAnnualBudget(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return calculateBudget(startDate, endDate);
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