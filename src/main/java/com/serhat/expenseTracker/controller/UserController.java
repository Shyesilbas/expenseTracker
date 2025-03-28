package com.serhat.expenseTracker.controller;

import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(){
        return ResponseEntity.ok(userService.userInfo());
    }


    @GetMapping("/monthly-income")
    public ResponseEntity<BigDecimal> getMonthlyIncome() {
        BigDecimal monthlyIncome = userService.monthlyIncome();
        return ResponseEntity.ok(monthlyIncome);
    }

    @GetMapping("/monthly-outgoings")
    public ResponseEntity<BigDecimal> getMonthlyOutgoings() {
        BigDecimal monthlyOutgoings = userService.monthlyOutgoings();
        return ResponseEntity.ok(monthlyOutgoings);
    }

    @GetMapping("/monthly-budget")
    public ResponseEntity<BigDecimal> getMonthlyBudgetStatus() {
        BigDecimal budgetStatus = userService.getMonthlyBudgetStatus();
        return ResponseEntity.ok(budgetStatus);
    }

    @GetMapping("/annual-income")
    public ResponseEntity<BigDecimal> getAnnualIncome() {
        BigDecimal annualIncome = userService.annualIncome();
        return ResponseEntity.ok(annualIncome);
    }

    @GetMapping("/annual-outgoings")
    public ResponseEntity<BigDecimal> getAnnualOutgoings() {
        BigDecimal annualOutgoings = userService.annualOutgoings();
        return ResponseEntity.ok(annualOutgoings);
    }
}