package com.serhat.expenseTracker.jwt;

import com.serhat.expenseTracker.entity.Token;
import com.serhat.expenseTracker.entity.enums.TokenStatus;
import com.serhat.expenseTracker.exception.InvalidTokenException;
import com.serhat.expenseTracker.repository.TokenRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtValidator{

    private final JwtExtractor jwtExtractor;
    private final TokenRepository tokenRepository;


    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = jwtExtractor.extractUsername(token);
            tokenRepository.findByToken(token)
                    .orElseThrow(() -> new InvalidTokenException("Token not found in database"));

            return username.equals(userDetails.getUsername()) && !isTokenInvalid(token);
        } catch (ExpiredJwtException e) {
            throw new InvalidTokenException("Token has expired");
        } catch (MalformedJwtException | UnsupportedJwtException e) {
            throw new InvalidTokenException("Invalid JWT token");
        } catch (Exception e) {
            throw new InvalidTokenException("Token validation failed: " + e.getMessage());
        }
    }

    private boolean isTokenInvalid(String token) {
        try {
            boolean isExpiredByDate = isTokenExpired(token);
            Token storedToken = tokenRepository.findByToken(token)
                    .orElseThrow(() -> new InvalidTokenException("Token not found in database"));
            boolean isExpiredByStatus = storedToken.getTokenStatus() != TokenStatus.ACTIVE;
            return isExpiredByDate || isExpiredByStatus;
        } catch (Exception e) {
            log.error("Error checking token validity", e);
            throw new InvalidTokenException("Error checking token validity");
        }
    }

    public boolean isTokenExpired(String token) {
        return jwtExtractor.extractExpiration(token).before(new Date());
    }

    public void invalidateToken(String token) {
        Token storedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token not found in database"));
        storedToken.setTokenStatus(TokenStatus.LOGGED_OUT);
        storedToken.setExpired_at(Date.from(Instant.now()));
        tokenRepository.save(storedToken);
    }

}