package com.serhat.expenseTracker.service.savings;

import com.serhat.expenseTracker.dto.objects.SavingGoalDto;
import com.serhat.expenseTracker.dto.objects.SavingsDto;
import com.serhat.expenseTracker.dto.requests.SavingGoalRequest;
import com.serhat.expenseTracker.dto.requests.SavingsRequest;
import com.serhat.expenseTracker.dto.requests.UpdateSavingsRequest;
import com.serhat.expenseTracker.entity.enums.Currency;

import java.util.List;

public interface SavingsService {
    SavingsDto addSaving(SavingsRequest request);
    List<SavingsDto> mySavings();
    String deleteSavingGoal(Long goalId);
    SavingGoalDto setSavingGoal(SavingGoalRequest savingGoalRequest);
    SavingGoalDto getSavingGoal(Long goalId);
    List<SavingGoalDto> getAllSavingGoals();
    SavingGoalDto updateSavingGoal(Long goalId, SavingGoalRequest savingGoalRequest);

    String deleteSavings(Long id);

    SavingsDto updateSavings(UpdateSavingsRequest request);

    List<SavingsDto> savingsByCurrency(Currency currency);
}
