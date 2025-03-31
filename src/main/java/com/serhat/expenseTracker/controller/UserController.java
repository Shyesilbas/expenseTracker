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
    public ResponseEntity<UserDto> me() {
        return ResponseEntity.ok(userService.userInfo());
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

    @GetMapping("/annual-budget/{year}")
    public ResponseEntity<BigDecimal> getAnnualBudget(
            @PathVariable int year) {
        BigDecimal annualBudget = userService.getAnnualBudget(year);
        return ResponseEntity.ok(annualBudget);
    }

    @GetMapping("/annual-income/{year}")
    public ResponseEntity<BigDecimal> getAnnualIncome(
            @PathVariable int year) {
        BigDecimal annualIncome = userService.getAnnualIncome(year);
        return ResponseEntity.ok(annualIncome);
    }

    @GetMapping("/annual-outgoings/{year}")
    public ResponseEntity<BigDecimal> getAnnualOutgoings(
            @PathVariable int year) {
        BigDecimal annualOutgoings = userService.getAnnualOutgoings(year);
        return ResponseEntity.ok(annualOutgoings);
    }
}