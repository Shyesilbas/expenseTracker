package com.serhat.expenseTracker.dto.requests;

public record LoginRequest(
        String username,
        String password,
        boolean rememberMe
) {
}
