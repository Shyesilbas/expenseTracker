package com.serhat.expenseTracker.controller;
import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/annual-income")
    public ResponseEntity<BigDecimal> getAnnualIncome() {
        BigDecimal monthlyIncome = userService.annualIncome();
        return ResponseEntity.ok(monthlyIncome);
    }

    @GetMapping("/annual-outgoings")
    public ResponseEntity<BigDecimal> getAnnualOutgoings() {
        BigDecimal monthlyOutgoings = userService.annualOutgoings();
        return ResponseEntity.ok(monthlyOutgoings);
    }

    @GetMapping("/monthly-budget")
    public ResponseEntity<BigDecimal> getMonthlyBudgetStatus() {
        BigDecimal budgetStatus = userService.getMonthlyBudgetStatus();
        return ResponseEntity.ok(budgetStatus);
    }

    @GetMapping("/annual-budget")
    public ResponseEntity<BigDecimal> getAnnualBudget() {
        BigDecimal annualOutgoings = userService.annualBudget();
        return ResponseEntity.ok(annualOutgoings);
    }

    @GetMapping("/budget/{year}/{month}")
    public ResponseEntity<BigDecimal> getBudgetStatusByYearAndMonth(
            @PathVariable int year,
            @PathVariable int month) {
        BigDecimal budgetStatus = userService.getBudgetStatusByYearAndMonth(year, month);
        return ResponseEntity.ok(budgetStatus);
    }

    @GetMapping("/income/{year}/{month}")
    public ResponseEntity<BigDecimal> getIncomeByYearAndMonth(
            @PathVariable int year,
            @PathVariable int month) {
        BigDecimal income = userService.getIncomeByYearAndMonth(year, month);
        return ResponseEntity.ok(income);
    }

    @GetMapping("/outgoings/{year}/{month}")
    public ResponseEntity<BigDecimal> getOutgoingsByYearAndMonth(
            @PathVariable int year,
            @PathVariable int month) {
        BigDecimal outgoings = userService.getOutgoingsByYearAndMonth(year, month);
        return ResponseEntity.ok(outgoings);
    }
}