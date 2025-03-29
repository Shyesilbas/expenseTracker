package com.serhat.expenseTracker.repository;

import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Expense;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense,Long> {
    List<Expense> findExpensesByUserAndCategory(AppUser user , Category category);
    List<Expense> findExpensesByUserAndStatus(AppUser user , Status status);

    List<Expense> findExpensesByUserAndCurrency(AppUser user, Currency currency);

    List<Expense> findExpensesByUserAndDate(AppUser user, LocalDate date);

    List<Expense> findByUser(AppUser user);
    Optional<Expense> findByUserAndExpenseId(AppUser user, Long expenseId);
    List<Expense> findExpensesByUserAndDateBetween(AppUser currentUser, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserAndDateBetween(AppUser user, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserAndCategoryAndDateBetween(AppUser user, Category category, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserAndStatusAndDateBetween(AppUser user, Status status, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserAndCurrencyAndDateBetween(AppUser user, Currency currency, LocalDate startDate, LocalDate endDate);
}
