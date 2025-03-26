package com.serhat.expenseTracker.dto.objects;

import lombok.Builder;

@Builder
public record UserDto(

        String username,
        String email
) {
}
