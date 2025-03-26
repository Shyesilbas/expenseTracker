package com.serhat.expenseTracker.mapper;

import com.serhat.expenseTracker.dto.responses.AuthResponse;
import com.serhat.expenseTracker.entity.enums.Role;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {
    public AuthResponse createAuthResponse(String token, String username, Role role, String message) {
        return AuthResponse.builder()
                .token(token)
                .username(username)
                .role(role)
                .message(message)
                .build();
    }
}
