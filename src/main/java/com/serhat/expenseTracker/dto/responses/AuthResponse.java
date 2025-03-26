package com.serhat.expenseTracker.dto.responses;

import com.serhat.expenseTracker.entity.enums.Role;
import lombok.Builder;

@Builder
public record AuthResponse(
        String token,
        String username,
        Role role,
        String message
) {
}
