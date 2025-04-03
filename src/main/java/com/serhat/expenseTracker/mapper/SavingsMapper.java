package com.serhat.expenseTracker.mapper;

import com.serhat.expenseTracker.dto.objects.SavingGoalDto;
import com.serhat.expenseTracker.dto.objects.SavingsDto;
import com.serhat.expenseTracker.entity.SavingGoal;
import com.serhat.expenseTracker.entity.Savings;
import org.springframework.stereotype.Component;

@Component
public class SavingsMapper {

    public SavingsDto toSavingsDto(Savings savings){
        return new SavingsDto(
                savings.getId(),
                savings.getCurrency(),
                savings.getAmount()
        );
    }

    public SavingGoalDto toSavingGoalDto(SavingGoal savingGoal){
        return new SavingGoalDto(
                savingGoal.getId(),
                savingGoal.getGoalAmount(),
                savingGoal.getCurrency(),
                savingGoal.getInitialAmount(),
                savingGoal.getDescription(),
                savingGoal.getGoalName(),
                savingGoal.getStartDate(),
                savingGoal.getTargetDate(),
                savingGoal.getGoalStatus()
        );
    }
}
