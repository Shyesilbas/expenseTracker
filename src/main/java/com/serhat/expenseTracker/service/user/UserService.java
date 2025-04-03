package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.enums.Currency;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;

public interface UserService {
    AppUser getCurrentUser();
    UserDto userInfo();
    void saveUser(AppUser user);
    AppUser createUser(RegisterRequest request);
    void validateRegistration(RegisterRequest request);
    UserDetails loadUserByUsername(String username);

    Currency setFavoriteCurrency(Currency currency);
    BigDecimal getBudgetStatusByYearAndMonth(int year, int month);
    BigDecimal getIncomeByYearAndMonth(int year, int month);
    BigDecimal getOutgoingsByYearAndMonth(int year, int month);
    BigDecimal getAnnualBudget(int year);
    BigDecimal getAnnualIncome(int year);
    BigDecimal getAnnualOutgoings(int year);
}