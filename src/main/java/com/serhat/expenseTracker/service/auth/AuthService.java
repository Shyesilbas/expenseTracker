package com.serhat.expenseTracker.service.auth;

import com.serhat.expenseTracker.dto.requests.LoginRequest;
import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.dto.responses.AuthResponse;
import com.serhat.expenseTracker.dto.responses.RegisterResponse;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.jwt.*;
import com.serhat.expenseTracker.service.auth.password.PasswordValidationService;
import com.serhat.expenseTracker.service.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final PasswordValidationService passwordValidationService;
    private final AuthResponseFactory authResponseFactory;
    private final CookiesService cookiesService;
    private final UserService userService;


    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        userService.validateRegistration(request);
        AppUser user = userService.createUser(request);
        return authResponseFactory.createRegisterResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        log.info("Attempting login for user: {}", request.username());
        UserDetails userDetails = userService.loadUserByUsername(request.username());
        passwordValidationService.validatePassword(request.password(), userDetails.getPassword());
        String accessToken = jwtService.generateToken(userDetails);
        cookiesService.addJwtTokenToCookie(response, accessToken);
        jwtService.saveToken(userDetails, accessToken);
        log.info("Login successful for user: {}", request.username());
        return authResponseFactory.createLoginResponse(userDetails,accessToken);
    }

    @Transactional
    public String logout(HttpServletRequest request,HttpServletResponse response) {
        log.info("Processing logout request");

        String jwtToken = jwtService.getTokenFromRequest(request);
        jwtService.invalidateAndBlacklistToken(jwtToken);
        cookiesService.clearJwtTokenCookie(response);
        SecurityContextHolder.clearContext();
        String username = jwtService.extractUsername(jwtToken);
        log.info("Logout successful for user: {}", username);

        return "Logout successful";
    }



}