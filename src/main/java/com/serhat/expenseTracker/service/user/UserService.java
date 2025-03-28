package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;

public interface UserService {
    AppUser getCurrentUser();
    BigDecimal getMonthlyBudgetStatus();
    UserDto userInfo();
    void saveUser(AppUser user);
    AppUser createUser(RegisterRequest request);
    void validateRegistration(RegisterRequest request);
    UserDetails loadUserByUsername(String username);

    BigDecimal monthlyIncome();
    BigDecimal monthlyOutgoings();
    BigDecimal annualOutgoings();
    BigDecimal annualIncome();
}
