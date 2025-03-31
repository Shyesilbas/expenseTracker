package com.serhat.expenseTracker.dto.objects;

import com.serhat.expenseTracker.entity.enums.Currency;
import lombok.Builder;

@Builder
public record UserDto(

        String username,
        String email,
        Currency favoriteCurrency
) {
}
