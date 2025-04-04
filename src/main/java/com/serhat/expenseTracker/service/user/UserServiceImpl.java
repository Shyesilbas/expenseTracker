package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Transaction;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import com.serhat.expenseTracker.mapper.UserMapper;
import com.serhat.expenseTracker.repository.TransactionRepository;
import com.serhat.expenseTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final UserValidationService userValidationService;
    private final UserMapper userMapper;
    private final UserDetailsServiceImpl userDetailsService;
    private final TransactionRepository transactionRepository;
    private final CurrentUserHolder currentUserHolder;

    @Override
    public AppUser getCurrentUser() {
        return currentUserHolder.getCurrentUser();
    }

    @Override
    public Currency setFavoriteCurrency(Currency currency) {
        logger.info("Setting favorite currency: {}", currency);
        AppUser user = currentUserHolder.getCurrentUser();
        user.setFavoriteCurrency(currency);
        userRepository.save(user);
        return currency;
    }

    private List<Transaction> getTransactionsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByUserAndDateBetween(
                currentUserHolder.getCurrentUser(), startDate, endDate);
    }

    private BigDecimal calculateAmountByStatus(List<Transaction> transactions, boolean isIncome) {
        return transactions.stream()
                .filter(t -> isIncome == (t.getStatus() == Status.INCOME))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private DateRange getMonthDateRange(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return new DateRange(startDate, endDate);
    }

    private DateRange getYearDateRange(int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return new DateRange(startDate, endDate);
    }

    @Override
    public BigDecimal getBudgetStatusByYearAndMonth(int year, int month) {
        DateRange range = getMonthDateRange(year, month);
        return calculateBudget(range.startDate(), range.endDate());
    }

    @Override
    public BigDecimal getIncomeByYearAndMonth(int year, int month) {
        DateRange range = getMonthDateRange(year, month);
        return getIncomeBetweenDates(range.startDate(), range.endDate());
    }

    @Override
    public BigDecimal getOutgoingsByYearAndMonth(int year, int month) {
        DateRange range = getMonthDateRange(year, month);
        return getOutgoingsBetweenDates(range.startDate(), range.endDate());
    }

    @Override
    public BigDecimal getAnnualIncome(int year) {
        DateRange range = getYearDateRange(year);
        return getIncomeBetweenDates(range.startDate(), range.endDate());
    }

    @Override
    public BigDecimal getAnnualOutgoings(int year) {
        DateRange range = getYearDateRange(year);
        return getOutgoingsBetweenDates(range.startDate(), range.endDate());
    }

    @Override
    public BigDecimal getAnnualBudget(int year) {
        DateRange range = getYearDateRange(year);
        return calculateBudget(range.startDate(), range.endDate());
    }

    private BigDecimal getIncomeBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionsBetweenDates(startDate, endDate);
        return calculateAmountByStatus(transactions, true);
    }

    private BigDecimal getOutgoingsBetweenDates(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionsBetweenDates(startDate, endDate);
        return calculateAmountByStatus(transactions, false);
    }

    private BigDecimal calculateBudget(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = getTransactionsBetweenDates(startDate, endDate);
        BigDecimal income = calculateAmountByStatus(transactions, true);
        BigDecimal outgoings = calculateAmountByStatus(transactions, false);
        return income.subtract(outgoings);
    }

    @Override
    public void saveUser(AppUser user) {
        logger.info("Saving user: {}", user.getUsername());
        userRepository.save(user);
    }

    @Override
    public AppUser createUser(RegisterRequest request) {
        logger.info("Creating new user: {}", request.username());
        AppUser user = userMapper.toUser(request);
        saveUser(user);
        return user;
    }

    @Override
    public void validateRegistration(RegisterRequest request) {
        logger.debug("Validating registration request for: {}", request.username());
        userValidationService.validateUserRegistration(request);
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return userDetailsService.loadUserByUsername(username);
    }


    private record DateRange(LocalDate startDate, LocalDate endDate) {}
}