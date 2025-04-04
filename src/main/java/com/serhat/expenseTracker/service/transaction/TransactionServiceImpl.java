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
import com.serhat.expenseTracker.service.user.CurrentUserHolder;
import com.serhat.expenseTracker.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private static final Logger logger = LoggerFactory.getLogger(TransactionServiceImpl.class);

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final CurrentUserHolder currentUserHolder;
    private final UserService userService;

    private AppUser getCurrentUser() {
        return currentUserHolder.getCurrentUser();
    }

    private List<Transaction> findExpensesByDateRange(AppUser user, LocalDate startDate, LocalDate endDate) {
        logger.debug("Finding expenses between {} and {}", startDate, endDate);
        return transactionRepository.findByUserAndDateBetween(user, startDate, endDate);
    }

    private List<Transaction> filterExpenses(List<Transaction> expenses, Category category, Status status, Currency currency, LocalDate date) {
        return expenses.stream()
                .filter(t -> category == null || t.getCategory() == category)
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> currency == null || t.getCurrency() == currency)
                .filter(t -> date == null || t.getDate().equals(date))
                .toList();
    }

    @Override
    public String deleteTransaction(Long transactionId) {
        logger.info("Deleting transaction with ID={}", transactionId);
        AppUser user = getCurrentUser();
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> {
                    logger.error("Transaction not found: ID={}", transactionId);
                    return new ExpenseNotFoundException("Transaction not found by id: " + transactionId);
                });

        transactionRepository.delete(transaction);
        logger.info("Transaction deleted: ID={}", transactionId);
        return "Transaction deleted successfully.";
    }

    @Override
    public TransactionDto updateTransaction(Long transactionId, UpdateTransactionRequest request) {
        logger.info("Updating transaction: ID={}", transactionId);
        if (transactionId == null) {
            throw new IllegalArgumentException("Transaction ID cannot be null");
        }

        AppUser user = getCurrentUser();
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> {
                    logger.error("Transaction not found: ID={}", transactionId);
                    return new ExpenseNotFoundException("Transaction not found by id: " + transactionId);
                });

        updateIfNotNull(transaction::setAmount, request.amount(), "amount", transaction.getAmount());
        updateIfNotNull(transaction::setCurrency, request.currency(), "currency", transaction.getCurrency());
        updateIfNotNull(transaction::setDescription, request.description(), "description", transaction.getDescription());
        updateIfNotNull(transaction::setStatus, request.status(), "status", transaction.getStatus());
        updateIfNotNull(transaction::setCategory, request.category(), "category", transaction.getCategory());
        updateIfNotNull(transaction::setDate, request.date(), "date", transaction.getDate());

        Transaction savedTransaction = transactionRepository.save(transaction);
        return transactionMapper.toTransactionDto(savedTransaction);
    }

    private <T> void updateIfNotNull(Consumer<T> setter, T newValue, String fieldName, T oldValue) {
        if (newValue != null) {
            setter.accept(newValue);
        }
    }

    @Override
    public TransactionDto createTransaction(TransactionRequest request) {
        logger.info("Creating new transaction");
        AppUser user = getCurrentUser();

        Transaction transaction = transactionMapper.toTransaction(request, user);
        Transaction savedTransaction = transactionRepository.save(transaction);

        logger.info("Transaction created: ID={}", savedTransaction.getTransactionId());
        return transactionMapper.toTransactionDto(savedTransaction);
    }

    @Override
    public TransactionDto findTransactionById(Long transactionId) {
        AppUser user = getCurrentUser();
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> {
                    logger.error("Transaction not found: ID={}", transactionId);
                    return new ExpenseNotFoundException("Transaction not found for user with id: " + transactionId);
                });

        return transactionMapper.toTransactionDto(transaction);
    }

    private SummaryDto getSummary(AppUser user, LocalDate startDate, LocalDate endDate,
                                  BigDecimal totalIncome, BigDecimal totalOutgoings, BigDecimal totalBudget) {
        List<Transaction> transactions = findExpensesByDateRange(user, startDate, endDate);
        Map<Category, List<CategoryExpensesDto>> groupedExpenses = groupExpensesByCategoryAndStatus(transactions);

        return new SummaryDto(totalIncome, totalOutgoings, totalBudget, groupedExpenses);
    }

    private Map<Category, List<CategoryExpensesDto>> groupExpensesByCategoryAndStatus(List<Transaction> transactions) {
        return transactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.mapping(
                                t -> {
                                    BigDecimal total = t.getAmount();
                                    return new CategoryExpensesDto(1, total, t.getStatus());
                                },
                                Collectors.collectingAndThen(
                                        Collectors.groupingBy(CategoryExpensesDto::status),
                                        statusMap -> statusMap.entrySet().stream()
                                                .map(entry -> new CategoryExpensesDto(
                                                        entry.getValue().size(),
                                                        entry.getValue().stream()
                                                                .map(CategoryExpensesDto::totalAmount)
                                                                .reduce(BigDecimal.ZERO, BigDecimal::add),
                                                        entry.getKey()
                                                ))
                                                .toList()
                                )
                        )
                ));
    }

    @Override
    public SummaryDto getSummaryByYearAndMonth(int year, int month) {
        logger.info("Getting summary for year={}, month={}", year, month);
        AppUser user = getCurrentUser();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        BigDecimal totalIncome = userService.getIncomeByYearAndMonth(year, month);
        BigDecimal totalOutgoings = userService.getOutgoingsByYearAndMonth(year, month);
        BigDecimal totalBudget = userService.getBudgetStatusByYearAndMonth(year, month);

        return getSummary(user, startDate, endDate, totalIncome, totalOutgoings, totalBudget);
    }

    @Override
    public SummaryDto getSummaryByYear(int year) {
        logger.info("Getting summary for year={}", year);
        AppUser user = getCurrentUser();
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);

        BigDecimal totalIncome = userService.getAnnualIncome(year);
        BigDecimal totalOutgoings = userService.getAnnualOutgoings(year);
        BigDecimal totalBudget = userService.getAnnualBudget(year);

        return getSummary(user, startDate, endDate, totalIncome, totalOutgoings, totalBudget);
    }

    @Override
    public List<TransactionDto> findTransactionsByFilters(Integer year, Integer month, Category category,
                                                          Status status, Currency currency, LocalDate date) {
        logger.info("Finding transactions with filters: year={}, month={}, category={}", year, month, category);
        AppUser user = getCurrentUser();

        LocalDate startDate, endDate;
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
        return filterExpenses(transactions, category, status, currency, date)
                .stream()
                .map(transactionMapper::toTransactionDto)
                .toList();
    }
}