package com.serhat.expenseTracker.service.transaction.recurring;

import com.serhat.expenseTracker.dto.objects.TransactionDto;
import com.serhat.expenseTracker.dto.requests.RecurringTransactionRequest;
import com.serhat.expenseTracker.dto.requests.RecurringTransactionUpdateRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Transaction;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.TransactionType;
import com.serhat.expenseTracker.mapper.TransactionMapper;
import com.serhat.expenseTracker.repository.TransactionRepository;
import com.serhat.expenseTracker.service.user.CurrentUserHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final CurrentUserHolder currentUserHolder;

    private AppUser getCurrentUser() {
        AppUser user = currentUserHolder.getCurrentUser();
        log.debug("Retrieved current user with ID: {}", user.getUserId());
        return user;
    }

    /**
     * Validates the basic parameters of a recurring transaction request
     * @param startMonth Start month of the recurring transaction
     * @param endMonth End month of the recurring transaction
     * @param dayOfMonth Day of month for the recurring transaction
     * @throws IllegalArgumentException If any parameter is invalid
     */
    private void validateRecurringTransactionParameters(int startMonth, int endMonth, int dayOfMonth) {
        if (startMonth < 1 || startMonth > 12) {
            log.error("Invalid start month: {}", startMonth);
            throw new IllegalArgumentException("Start month must be between 1 and 12: " + startMonth);
        }
        if (endMonth < 1 || endMonth > 12) {
            log.error("Invalid end month: {}", endMonth);
            throw new IllegalArgumentException("End month must be between 1 and 12: " + endMonth);
        }
        if (dayOfMonth < 1 || dayOfMonth > 31) {
            log.error("Invalid day of month: {}", dayOfMonth);
            throw new IllegalArgumentException("Day of month must be between 1 and 31: " + dayOfMonth);
        }
        log.debug("Parameters validated: startMonth={}, endMonth={}, dayOfMonth={}", startMonth, endMonth, dayOfMonth);
    }

    /**
     * Finds a transaction by ID and verifies its part of a recurring series
     * @param transactionId The transaction ID to find
     * @return The transaction and its recurring series ID
     * @throws IllegalArgumentException If transaction not found
     * @throws IllegalStateException If transaction is not part of a recurring series
     */
    private Transaction findAndValidateRecurringTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> {
                    log.error("Transaction not found with ID: {}", transactionId);
                    return new IllegalArgumentException("Recurring transaction not found");
                });
        log.debug("Found transaction with ID: {}", transactionId);

        String recurringSeriesId = transaction.getRecurringSeriesId();
        if (recurringSeriesId == null) {
            log.error("Transaction ID {} is not part of a recurring series", transactionId);
            throw new IllegalStateException("Transaction is not part of a recurring series");
        }
        log.debug("Transaction belongs to recurring series: {}", recurringSeriesId);

        return transaction;
    }

    /**
     * Calculates the date range for recurring transactions
     * @param startYear Start year
     * @param startMonth Start month
     * @param endYear End year
     * @param endMonth End month
     * @return Start and end dates for the recurring transactions
     */
    private LocalDate[] calculateDateRange(int startYear, int startMonth, int endYear, int endMonth) {
        LocalDate start = LocalDate.of(startYear, startMonth, 1);
        LocalDate end = LocalDate.of(endYear, endMonth, 1)
                .withDayOfMonth(LocalDate.of(endYear, endMonth, 1).lengthOfMonth());
        log.debug("Date range for recurring transactions: {} to {}", start, end);
        return new LocalDate[]{start, end};
    }

    /**
     * Creates a transaction entity for a recurring series
     * @param request Transaction request data
     * @param user Current user
     * @param selectedCurrency Selected currency
     * @param currentDate Date for this instance
     * @param recurringSeriesId ID of the recurring series
     * @return Built transaction entity
     */
    private Transaction buildRecurringTransaction(
            RecurringTransactionRequest request,
            AppUser user,
            Currency selectedCurrency,
            LocalDate currentDate,
            String recurringSeriesId) {

        return Transaction.builder()
                .amount(request.amount())
                .description(request.description())
                .category(request.category())
                .date(currentDate)
                .status(request.status())
                .currency(selectedCurrency)
                .user(user)
                .type(TransactionType.RECURRING)
                .dayOfMonth(request.dayOfMonth())
                .startMonth(request.startMonth())
                .startYear(request.startYear())
                .endMonth(request.endMonth())
                .endYear(request.endYear())
                .recurringSeriesId(recurringSeriesId)
                .build();
    }

    /**
     * Converts RecurringTransactionUpdateRequest to RecurringTransactionRequest
     * @param request Update request
     * @return Equivalent create request
     */
    private RecurringTransactionRequest convertToCreateRequest(RecurringTransactionUpdateRequest request) {
        return new RecurringTransactionRequest(
                request.amount(),
                request.description(),
                request.category(),
                request.status(),
                request.currency(),
                request.startMonth(),
                request.startYear(),
                request.endMonth(),
                request.endYear(),
                request.dayOfMonth()
        );
    }

    /**
     * Updates transaction details without changing schedule
     * @param transaction Transaction to update
     * @param request Update request
     */
    private void updateTransactionDetails(Transaction transaction, RecurringTransactionUpdateRequest request) {
        transaction.setAmount(request.amount());
        transaction.setDescription(request.description());
        transaction.setCategory(request.category());
        transaction.setStatus(request.status());
        transaction.setCurrency(request.currency());
    }

    /**
     * Checks if schedule parameters have changed in update request
     * @param transaction Original transaction
     * @param request Update request
     * @return True if schedule parameters changed
     */
    private boolean hasScheduleChanged(Transaction transaction, RecurringTransactionUpdateRequest request) {
        boolean scheduleChanged = request.startYear() != transaction.getStartYear() ||
                request.startMonth() != transaction.getStartMonth() ||
                request.endYear() != transaction.getEndYear() ||
                request.endMonth() != transaction.getEndMonth() ||
                !request.dayOfMonth().equals(transaction.getDayOfMonth());

        log.debug("Schedule parameters changed: {}", scheduleChanged);
        return scheduleChanged;
    }

    @Override
    @Transactional
    public TransactionDto createRecurringTransaction(RecurringTransactionRequest request) {
        log.info("Creating recurring transaction with request: {}", request);

        try {
            // Validate input parameters
            validateRecurringTransactionParameters(request.startMonth(), request.endMonth(), request.dayOfMonth());

            AppUser user = getCurrentUser();
            log.debug("User's favorite currency: {}", user.getFavoriteCurrency());
            Currency selectedCurrency = user.getFavoriteCurrency() != null ? user.getFavoriteCurrency() : request.currency();
            log.debug("Selected currency for transaction: {}", selectedCurrency);

            LocalDate[] dateRange = calculateDateRange(request.startYear(), request.startMonth(), request.endYear(), request.endMonth());
            LocalDate start = dateRange[0];
            LocalDate end = dateRange[1];

            int dayOfMonth = request.dayOfMonth() != null && request.dayOfMonth() >= 1 && request.dayOfMonth() <= 31
                    ? request.dayOfMonth()
                    : 1;
            log.debug("Using day of month: {}", dayOfMonth);

            String recurringSeriesId = UUID.randomUUID().toString();
            log.debug("Generated recurring series ID: {}", recurringSeriesId);

            Transaction firstTransaction = null;
            LocalDate currentDate = start.withDayOfMonth(Math.min(dayOfMonth, start.lengthOfMonth()));
            int transactionCount = 0;

            while (!currentDate.isAfter(end)) {
                log.debug("Creating transaction for date: {}", currentDate);
                Transaction recurringTransaction = buildRecurringTransaction(
                        request, user, selectedCurrency, currentDate, recurringSeriesId);

                Transaction savedTransaction = transactionRepository.save(recurringTransaction);
                log.debug("Saved transaction with ID: {}", savedTransaction.getTransactionId());

                if (firstTransaction == null) {
                    firstTransaction = savedTransaction;
                    log.debug("Set first transaction with ID: {}", firstTransaction.getTransactionId());
                }

                currentDate = currentDate.plusMonths(1).withDayOfMonth(Math.min(dayOfMonth, currentDate.plusMonths(1).lengthOfMonth()));
                transactionCount++;
            }

            log.info("Successfully created {} recurring transactions in series: {}", transactionCount, recurringSeriesId);
            return transactionMapper.toTransactionDto(firstTransaction);
        } catch (Exception e) {
            log.error("Error creating recurring transaction: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<TransactionDto> getRecurringTransactions() {
        log.info("Retrieving all recurring transactions for current user");

        try {
            AppUser user = getCurrentUser();
            List<Transaction> recurringTransactions = transactionRepository.findByUserAndType(user, TransactionType.RECURRING);
            log.debug("Found {} total recurring transactions for user ID: {}", recurringTransactions.size(), user.getUserId());

            Map<String, Transaction> uniqueRecurringTransactions = recurringTransactions.stream()
                    .collect(Collectors.toMap(
                            Transaction::getRecurringSeriesId,
                            transaction -> transaction,
                            (existing, replacement) -> existing.getDate().isBefore(replacement.getDate()) ? existing : replacement
                    ));
            log.debug("Filtered to {} unique recurring transaction series", uniqueRecurringTransactions.size());

            List<TransactionDto> result = uniqueRecurringTransactions.values().stream()
                    .map(transactionMapper::toTransactionDto)
                    .toList();

            log.info("Successfully retrieved {} recurring transaction series", result.size());
            return result;
        } catch (Exception e) {
            log.error("Error retrieving recurring transactions: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public TransactionDto updateRecurringTransaction(Long transactionId, RecurringTransactionUpdateRequest request) {
        log.info("Updating recurring transaction with ID: {} and request: {}", transactionId, request);

        try {
            Transaction transaction = findAndValidateRecurringTransaction(transactionId);
            String recurringSeriesId = transaction.getRecurringSeriesId();

            List<Transaction> seriesToUpdate = transactionRepository.findByRecurringSeriesId(recurringSeriesId);
            log.debug("Found {} transactions in recurring series ID: {}", seriesToUpdate.size(), recurringSeriesId);

            if (hasScheduleChanged(transaction, request)) {
                log.info("Recreating recurring series with new schedule parameters");
                int deletedCount = transactionRepository.deleteByRecurringSeriesId(recurringSeriesId);
                log.debug("Deleted {} transactions from series: {}", deletedCount, recurringSeriesId);

                RecurringTransactionRequest newRequest = convertToCreateRequest(request);

                log.debug("Creating new recurring transaction series with updated parameters");
                return createRecurringTransaction(newRequest);
            } else {
                log.info("Updating {} transactions in series with new transaction details", seriesToUpdate.size());
                for (Transaction t : seriesToUpdate) {
                    log.debug("Updating transaction ID: {}", t.getTransactionId());
                    updateTransactionDetails(t, request);
                    transactionRepository.save(t);
                }

                log.info("Successfully updated all transactions in recurring series: {}", recurringSeriesId);
                return transactionMapper.toTransactionDto(transaction);
            }
        } catch (Exception e) {
            log.error("Error updating recurring transaction: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public String deleteRecurringSeries(Long transactionId) {
        log.info("Deleting recurring series for transaction ID: {}", transactionId);

        try {
            Transaction transaction = findAndValidateRecurringTransaction(transactionId);
            String recurringSeriesId = transaction.getRecurringSeriesId();

            int deleted = transactionRepository.deleteByRecurringSeriesId(recurringSeriesId);
            log.info("Successfully deleted {} recurring transactions from series: {}", deleted, recurringSeriesId);

            return "Successfully deleted " + deleted + " recurring transactions";
        } catch (Exception e) {
            log.error("Error deleting recurring transaction series: {}", e.getMessage(), e);
            throw e;
        }
    }
}