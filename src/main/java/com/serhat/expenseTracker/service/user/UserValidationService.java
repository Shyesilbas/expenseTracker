package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.requests.RegisterRequest;

public interface UserValidationService {
    void validateUserRegistration(RegisterRequest request);

}
