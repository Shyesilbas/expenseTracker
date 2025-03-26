package com.serhat.expenseTracker.service.auth.password;

public interface PasswordValidationService {
    void validatePassword(String rawPassword, String encodedPassword);
}
