package com.serhat.expenseTracker.repository;

import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.SavingGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal,Long> {
    List<SavingGoal> findByUser(AppUser user);

    Optional<SavingGoal> findByUserAndId(AppUser user, Long goalId);
}
