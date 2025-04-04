package com.serhat.expenseTracker.service.savings;

import com.serhat.expenseTracker.dto.objects.SavingGoalDto;
import com.serhat.expenseTracker.dto.requests.SavingGoalRequest;

import java.util.List;

public interface SavingGoalService {
    SavingGoalDto setSavingGoal(SavingGoalRequest savingGoalRequest);
    SavingGoalDto getSavingGoal(Long goalId);
    List<SavingGoalDto> getAllSavingGoals();
    String deleteSavingGoal(Long goalId);
    SavingGoalDto updateSavingGoal(Long goalId, SavingGoalRequest savingGoalRequest);
}
