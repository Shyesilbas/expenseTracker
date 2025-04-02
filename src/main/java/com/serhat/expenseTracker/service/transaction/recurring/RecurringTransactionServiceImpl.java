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
import com.serhat.expenseTracker.service.user.UserService;
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
    private final UserService userService;

    private AppUser currentUser() {
        return userService.getCurrentUser();
    }

    @Override
    @Transactional
    public TransactionDto createRecurringTransaction(RecurringTransactionRequest request) {
        AppUser user = currentUser();
        Currency selectedCurrency = user.getFavoriteCurrency() != null ? user.getFavoriteCurrency() : request.currency();

        LocalDate start = LocalDate.of(request.startYear(), request.startMonth(), 1);
        LocalDate end = LocalDate.of(request.endYear(), request.endMonth(), 1)
                .withDayOfMonth(LocalDate.of(request.endYear(), request.endMonth(), 1).lengthOfMonth());

        int dayOfMonth = request.dayOfMonth() != null && request.dayOfMonth() >= 1 && request.dayOfMonth() <= 31
                ? request.dayOfMonth()
                : 1;

        // Generate a unique series ID for this set of recurring transactions
        String recurringSeriesId = UUID.randomUUID().toString();

        Transaction firstTransaction = null;
        LocalDate currentDate = start.withDayOfMonth(Math.min(dayOfMonth, start.lengthOfMonth()));

        while (!currentDate.isAfter(end)) {
            Transaction recurringTransaction = Transaction.builder()
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
                    .recurringSeriesId(recurringSeriesId) // Add this field to your Transaction entity
                    .build();

            transactionRepository.save(recurringTransaction);
            if (firstTransaction == null) {
                firstTransaction = recurringTransaction;
            }
            currentDate = currentDate.plusMonths(1).withDayOfMonth(Math.min(dayOfMonth, currentDate.plusMonths(1).lengthOfMonth()));
        }
        return transactionMapper.toTransactionDto(firstTransaction);
    }

    @Override
    public List<TransactionDto> getRecurringTransactions() {
        AppUser user = currentUser();
        List<Transaction> recurringTransactions = transactionRepository.findByUserAndType(user, TransactionType.RECURRING);

        // Group by recurringSeriesId instead of constructed key
        Map<String, Transaction> uniqueRecurringTransactions = recurringTransactions.stream()
                .collect(Collectors.toMap(
                        Transaction::getRecurringSeriesId,
                        transaction -> transaction,
                        (existing, replacement) -> existing.getDate().isBefore(replacement.getDate()) ? existing : replacement
                ));

        return uniqueRecurringTransactions.values().stream()
                .map(transactionMapper::toTransactionDto)
                .toList();
    }

    @Override
    @Transactional
    public TransactionDto updateRecurringTransaction(Long transactionId, RecurringTransactionUpdateRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Recurring transaction not found"));

        String recurringSeriesId = transaction.getRecurringSeriesId();
        if (recurringSeriesId == null) {
            throw new IllegalStateException("Transaction is not part of a recurring series");
        }

        List<Transaction> seriesToUpdate = transactionRepository.findByRecurringSeriesId(recurringSeriesId);

        if (request.startYear() != transaction.getStartYear() ||
                request.startMonth() != transaction.getStartMonth() ||
                request.endYear() != transaction.getEndYear() ||
                request.endMonth() != transaction.getEndMonth() ||
                !request.dayOfMonth().equals(transaction.getDayOfMonth())) {

            transactionRepository.deleteByRecurringSeriesId(recurringSeriesId);

            RecurringTransactionRequest newRequest = new RecurringTransactionRequest(
                    request.amount(),
                    request.description(),
                    request.category(),
                    request.status(),
                    request.currency(),
                    request.dayOfMonth(),
                    request.startMonth(),
                    request.startYear(),
                    request.endMonth(),
                    request.endYear()
            );

            return createRecurringTransaction(newRequest);
        } else {
            for (Transaction t : seriesToUpdate) {
                t.setAmount(request.amount());
                t.setDescription(request.description());
                t.setCategory(request.category());
                t.setStatus(request.status());
                t.setCurrency(request.currency());
                transactionRepository.save(t);
            }

            return transactionMapper.toTransactionDto(transaction);
        }
    }

    @Override
    @Transactional
    public String deleteRecurringSeries(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Recurring transaction not found"));

        String recurringSeriesId = transaction.getRecurringSeriesId();
        if (recurringSeriesId == null) {
            throw new IllegalStateException("Transaction is not part of a recurring series");
        }

        int deleted = transactionRepository.deleteByRecurringSeriesId(recurringSeriesId);

        return "Successfully deleted " + deleted + " recurring transactions";
    }

    /*
    @Override
    @Transactional
    public String deleteSingleRecurringTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (transaction.getType() != TransactionType.RECURRING || transaction.getRecurringSeriesId() == null) {
            throw new IllegalStateException("Transaction is not part of a recurring series");
        }

        transactionRepository.deleteById(transactionId);

        return "Successfully deleted single transaction from recurring series";
    }

     */
}