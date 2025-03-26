package com.serhat.expenseTracker.dto.responses;

import com.serhat.expenseTracker.entity.enums.MembershipPlan;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record RegisterResponse(
        String message,
        String username,
        String email ,
        MembershipPlan membershipPlan,
        LocalDateTime registerDate
) {
}
