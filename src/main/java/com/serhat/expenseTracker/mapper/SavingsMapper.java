package com.serhat.expenseTracker.mapper;

import com.serhat.expenseTracker.dto.objects.SavingsDto;
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
}
