package com.serhat.expenseTracker.jwt;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtValidator jwtValidator;
    private final JwtProvider jwtProvider;
    private final JwtExtractor jwtExtractor;
    private final TokenBlacklistService blacklistService;

    public String generateToken(UserDetails userDetails) {
        return jwtProvider.generateToken(userDetails);
    }

    public void saveToken(UserDetails userDetails, String token) {
        jwtProvider.saveToken(userDetails, token);
    }

    public String extractUsername(String token) {
        return jwtExtractor.extractUsername(token);
    }

    public String extracRole(String token) {
        return jwtExtractor.extractRole(token);
    }

    public boolean validateToken(String token , UserDetails userDetails){
        return jwtValidator.validateToken(token, userDetails);
    }

    public void invalidateAndBlacklistToken(String token) {
        jwtValidator.invalidateToken(token);
        blacklistService.blacklistToken(token);
    }

    public String getTokenFromRequest(HttpServletRequest request) {
        return jwtExtractor.getTokenFromAuthorizationHeader(request);
    }

}
