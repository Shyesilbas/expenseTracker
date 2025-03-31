package com.serhat.expenseTracker.dto.objects;

import com.serhat.expenseTracker.entity.enums.Category;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record SummaryDto(
         BigDecimal totalIncome,
         BigDecimal totalOutgoings,
         BigDecimal totalBudget,
         Map<Category, List<CategoryExpensesDto>> categories
) {
}
