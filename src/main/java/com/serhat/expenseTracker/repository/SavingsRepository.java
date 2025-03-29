package com.serhat.expenseTracker.repository;

import com.serhat.expenseTracker.dto.objects.SavingsDto;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.Savings;
import com.serhat.expenseTracker.entity.enums.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsRepository extends JpaRepository<Savings,Long> {
    List<Savings> findByUser(AppUser user);

    List<Savings> findByUserAndCurrency(AppUser user, Currency currency);

    Optional<Savings> findByUserAndId(AppUser user, Long id);
}
