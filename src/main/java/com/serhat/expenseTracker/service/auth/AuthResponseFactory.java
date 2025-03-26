package com.serhat.expenseTracker.service.auth;

import com.serhat.expenseTracker.dto.responses.AuthResponse;
import com.serhat.expenseTracker.dto.responses.RegisterResponse;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.entity.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthResponseFactory {


    public RegisterResponse createRegisterResponse(AppUser user) {
        return new RegisterResponse(
                "Register Successful! Now you can login with your credentials.",
                user.getUsername(),
                user.getEmail(),
                user.getMembershipPlan(),
                LocalDateTime.now()
        );
    }

    public AuthResponse createLoginResponse(UserDetails userDetails, String token) {
        return AuthResponse.builder()
                .token(token)
                .username(userDetails.getUsername())
                .role(Role.valueOf(userDetails.getAuthorities().iterator().next().getAuthority()))
                .message("Login successful")
                .build();
    }

}
