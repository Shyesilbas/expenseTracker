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
import com.serhat.expenseTracker.entity.enums.TransactionType;
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
        logger.debug("Fetching current user from CurrentUserHolder");
        AppUser user = currentUserHolder.getCurrentUser();
        logger.debug("Current user fetched: username={}", user.getUsername());
        return user;
    }

    private List<Transaction> findExpensesByDateRange(AppUser user, LocalDate startDate, LocalDate endDate) {
        logger.debug("Finding expenses for user={} between startDate={} and endDate={}", user.getUsername(), startDate, endDate);
        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, startDate, endDate);
        logger.debug("Found {} transactions for user={} in date range", transactions.size(), user.getUsername());
        return transactions;
    }

    private List<Transaction> filterExpenses(List<Transaction> expenses, Category category, Status status, Currency currency, LocalDate date) {
        logger.debug("Filtering expenses: category={}, status={}, currency={}, date={}", category, status, currency, date);
        List<Transaction> filtered = expenses.stream()
                .filter(t -> category == null || t.getCategory() == category)
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> currency == null || t.getCurrency() == currency)
                .filter(t -> date == null || t.getDate().equals(date))
                .toList();
        logger.debug("Filtered down to {} transactions", filtered.size());
        return filtered;
    }

    @Override
    public String deleteTransaction(Long transactionId) {
        logger.info("Entering deleteTransaction with transactionId={}", transactionId);
        AppUser user = getCurrentUser();
        logger.debug("Fetching transaction with ID={} for user={}", transactionId, user.getUsername());
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> {
                    logger.error("Transaction not found for ID={} and user={}", transactionId, user.getUsername());
                    return new ExpenseNotFoundException("Transaction not found by id: " + transactionId);
                });
        logger.debug("Transaction found: ID={}, date={}, amount={}", transaction.getTransactionId(), transaction.getDate(), transaction.getAmount());
        transactionRepository.delete(transaction);
        logger.info("Transaction ID={} deleted successfully for user={}", transactionId, user.getUsername());
        return "Transaction deleted successfully.";
    }

    @Override
    public TransactionDto updateTransaction(Long transactionId, UpdateTransactionRequest request) {
        logger.info("Entering updateTransaction with transactionId={} and request={}", transactionId, request);
        if (transactionId == null) {
            logger.error("Transaction ID is null");
            throw new IllegalArgumentException("Transaction ID cannot be null");
        }

        AppUser user = getCurrentUser();
        logger.debug("Fetching transaction with ID={} for user={}", transactionId, user.getUsername());
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> {
                    logger.error("Transaction not found for ID={} and user={}", transactionId, user.getUsername());
                    return new ExpenseNotFoundException("Transaction not found by id: " + transactionId);
                });

        logger.debug("Updating transaction ID={} for user={}", transactionId, user.getUsername());
        if (request.amount() != null) {
            logger.debug("Updating amount from {} to {}", transaction.getAmount(), request.amount());
            transaction.setAmount(request.amount());
        }
        if (request.currency() != null) {
            logger.debug("Updating currency from {} to {}", transaction.getCurrency(), request.currency());
            transaction.setCurrency(request.currency());
        }
        if (request.description() != null) {
            logger.debug("Updating description from {} to {}", transaction.getDescription(), request.description());
            transaction.setDescription(request.description());
        }
        if (request.status() != null) {
            logger.debug("Updating status from {} to {}", transaction.getStatus(), request.status());
            transaction.setStatus(request.status());
        }
        if (request.category() != null) {
            logger.debug("Updating category from {} to {}", transaction.getCategory(), request.category());
            transaction.setCategory(request.category());
        }
        if (request.date() != null) {
            logger.debug("Updating date from {} to {}", transaction.getDate(), request.date());
            transaction.setDate(request.date());
        }

        logger.debug("Saving updated transaction ID={}", transactionId);
        Transaction savedTransaction = transactionRepository.save(transaction);
        logger.info("Updated transaction ID={} successfully for user={}", transactionId, user.getUsername());
        TransactionDto result = transactionMapper.toTransactionDto(savedTransaction);
        logger.debug("Returning TransactionDto: {}", result);
        return result;
    }

    @Override
    public TransactionDto createTransaction(TransactionRequest request) {
        logger.info("Entering createTransaction with request={}", request);
        AppUser user = getCurrentUser();
        logger.debug("Determining currency for user={}", user.getUsername());
        Currency selectedCurrency = user.getFavoriteCurrency() != null ? user.getFavoriteCurrency() : request.currency();
        logger.debug("Selected currency: {}", selectedCurrency);

        logger.debug("Building new transaction for user={}", user.getUsername());
        Transaction transaction = Transaction.builder()
                .amount(request.amount())
                .description(request.description())
                .category(request.category())
                .date(request.date() != null ? request.date() : LocalDate.now())
                .status(request.status())
                .currency(selectedCurrency)
                .user(user)
                .type(TransactionType.ONE_TIME)
                .build();
        logger.debug("Transaction built: amount={}, date={}, category={}", transaction.getAmount(), transaction.getDate(), transaction.getCategory());

        logger.debug("Saving new transaction");
        Transaction savedTransaction = transactionRepository.save(transaction);
        logger.info("Created transaction ID={} for user={}", savedTransaction.getTransactionId(), user.getUsername());
        TransactionDto result = transactionMapper.toTransactionDto(savedTransaction);
        logger.debug("Returning TransactionDto: {}", result);
        return result;
    }

    @Override
    public TransactionDto findTransactionById(Long transactionId) {
        logger.info("Entering findTransactionById with transactionId={}", transactionId);
        AppUser user = getCurrentUser();
        logger.debug("Fetching transaction with ID={} for user={}", transactionId, user.getUsername());
        Transaction transaction = transactionRepository.findByUserAndTransactionId(user, transactionId)
                .orElseThrow(() -> {
                    logger.error("Transaction not found for ID={} and user={}", transactionId, user.getUsername());
                    return new ExpenseNotFoundException("Transaction not found for user with id: " + transactionId);
                });
        logger.debug("Transaction found: ID={}, date={}, amount={}", transaction.getTransactionId(), transaction.getDate(), transaction.getAmount());
        TransactionDto result = transactionMapper.toTransactionDto(transaction);
        logger.info("Returning TransactionDto for ID={} and user={}", transactionId, user.getUsername());
        logger.debug("TransactionDto: {}", result);
        return result;
    }

    private SummaryDto getSummary(AppUser user, LocalDate startDate, LocalDate endDate,
                                  BigDecimal totalIncome, BigDecimal totalOutgoings, BigDecimal totalBudget) {
        logger.info("Entering getSummary for user={}, startDate={}, endDate={}, income={}, outgoings={}, budget={}",
                user.getUsername(), startDate, endDate, totalIncome, totalOutgoings, totalBudget);
        logger.debug("Fetching transactions for summary");
        List<Transaction> transactions = findExpensesByDateRange(user, startDate, endDate);

        logger.debug("Grouping transactions by category and status");
        Map<Category, List<CategoryExpensesDto>> groupedExpenses = transactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.collectingAndThen(
                                Collectors.groupingBy(
                                        Transaction::getStatus,
                                        Collectors.mapping(
                                                t -> new CategoryExpensesDto(1, t.getAmount(), t.getStatus()),
                                                Collectors.toList()
                                        )
                                ),
                                statusMap -> statusMap.entrySet().stream()
                                        .map(entry -> {
                                            int count = entry.getValue().size();
                                            BigDecimal total = entry.getValue().stream()
                                                    .map(CategoryExpensesDto::totalAmount)
                                                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                                            logger.debug("Category={}, Status={}, Count={}, Total={}",
                                                    transactions.get(0).getCategory(), entry.getKey(), count, total);
                                            return new CategoryExpensesDto(count, total, entry.getKey());
                                        })
                                        .toList()
                        )
                ));

        logger.debug("Constructing SummaryDto");
        SummaryDto summary = new SummaryDto(totalIncome, totalOutgoings, totalBudget, groupedExpenses);
        logger.info("Returning SummaryDto for user={} and date range {}-{}", user.getUsername(), startDate, endDate);
        logger.debug("SummaryDto: {}", summary);
        return summary;
    }

    @Override
    public SummaryDto getSummaryByYearAndMonth(int year, int month) {
        logger.info("Entering getSummaryByYearAndMonth with year={} and month={}", year, month);
        AppUser user = getCurrentUser();
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        logger.debug("Date range set: startDate={}, endDate={}", startDate, endDate);

        logger.debug("Fetching total income, outgoings, and budget from UserService");
        BigDecimal totalIncome = userService.getIncomeByYearAndMonth(year, month);
        BigDecimal totalOutgoings = userService.getOutgoingsByYearAndMonth(year, month);
        BigDecimal totalBudget = userService.getBudgetStatusByYearAndMonth(year, month);
        logger.debug("Fetched: income={}, outgoings={}, budget={}", totalIncome, totalOutgoings, totalBudget);

        SummaryDto result = getSummary(user, startDate, endDate, totalIncome, totalOutgoings, totalBudget);
        logger.info("Returning SummaryDto for year={} and month={} for user={}", year, month, user.getUsername());
        return result;
    }

    @Override
    public SummaryDto getSummaryByYear(int year) {
        logger.info("Entering getSummaryByYear with year={}", year);
        AppUser user = getCurrentUser();
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        logger.debug("Date range set: startDate={}, endDate={}", startDate, endDate);

        logger.debug("Fetching annual income, outgoings, and budget from UserService");
        BigDecimal totalIncome = userService.getAnnualIncome(year);
        BigDecimal totalOutgoings = userService.getAnnualOutgoings(year);
        BigDecimal totalBudget = userService.getAnnualBudget(year);
        logger.debug("Fetched: income={}, outgoings={}, budget={}", totalIncome, totalOutgoings, totalBudget);

        SummaryDto result = getSummary(user, startDate, endDate, totalIncome, totalOutgoings, totalBudget);
        logger.info("Returning SummaryDto for year={} for user={}", year, user.getUsername());
        return result;
    }

    @Override
    public List<TransactionDto> findTransactionsByFilters(Integer year, Integer month, Category category,
                                                          Status status, Currency currency, LocalDate date) {
        logger.info("Entering findTransactionsByFilters with year={}, month={}, category={}, status={}, currency={}, date={}",
                year, month, category, status, currency, date);
        AppUser user = getCurrentUser();

        LocalDate startDate, endDate;
        if (year != null && month != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            logger.debug("Date range set for year and month: startDate={}, endDate={}", startDate, endDate);
        } else if (year != null) {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
            logger.debug("Date range set for year: startDate={}, endDate={}", startDate, endDate);
        } else {
            startDate = LocalDate.of(1970, 1, 1);
            endDate = LocalDate.now();
            logger.debug("Default date range set: startDate={}, endDate={}", startDate, endDate);
        }

        logger.debug("Fetching transactions for filtering");
        List<Transaction> transactions = findExpensesByDateRange(user, startDate, endDate);
        logger.debug("Filtering transactions");
        List<TransactionDto> result = filterExpenses(transactions, category, status, currency, date)
                .stream()
                .map(transactionMapper::toTransactionDto)
                .toList();
        logger.info("Returning {} filtered transactions for user={}", result.size(), user.getUsername());
        logger.debug("Filtered TransactionDtos: {}", result);
        return result;
    }
}