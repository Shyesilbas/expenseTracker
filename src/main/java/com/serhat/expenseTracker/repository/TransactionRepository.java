package com.serhat.expenseTracker.repository;

import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Transaction;
import com.serhat.expenseTracker.entity.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction,Long> {
    Optional<Transaction> findByUserAndTransactionId(AppUser user, Long transactionId);

    List<Transaction> findByUserAndDateBetween(AppUser user, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserAndType(AppUser user, TransactionType transactionType);
}
