package com.serhat.expenseTracker.dto.objects;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.expenseTracker.entity.enums.Category;
import com.serhat.expenseTracker.entity.enums.Currency;
import com.serhat.expenseTracker.entity.enums.PaymentMethod;
import com.serhat.expenseTracker.entity.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseDto(
         Long expenseId,
         BigDecimal amount,
         Currency currency,
         @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
         LocalDate date,
         Category category,
         Status status,
         String description,
         PaymentMethod paymentMethod
) {
}
