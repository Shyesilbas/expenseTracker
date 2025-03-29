package com.serhat.expenseTracker.mapper;

import com.serhat.expenseTracker.dto.objects.ExpenseDto;
import com.serhat.expenseTracker.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public ExpenseDto toExpenseDto(Expense expense){
        return new ExpenseDto(
                expense.getExpenseId(),
                expense.getAmount(),
                expense.getCurrency(),
                expense.getDate(),
                expense.getCategory(),
                expense.getStatus(),
                expense.getDescription()
        );
    }

}
