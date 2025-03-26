package com.serhat.expenseTracker.jwt;

import com.serhat.expenseTracker.entity.Token;
import com.serhat.expenseTracker.entity.enums.TokenStatus;
import com.serhat.expenseTracker.repository.TokenRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtProvider {

    @Value("${security.jwt.expiration-time}")
    private long expiration;

    @Value("${security.jwt.secret-key}")
    private String secret;
    private final TokenRepository tokenRepository;


    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    public String generateToken(UserDetails userDetails) {
        log.info("Generating token for user: {}", userDetails.getUsername());
        Map<String, Object> claims = new HashMap<>();

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    public void saveToken(UserDetails userDetails, String token) {
        try {
            Token newToken = Token.builder()
                    .username(userDetails.getUsername())
                    .token(token)
                    .createdAt(new Date())
                    .expiresAt(new Date(System.currentTimeMillis() + expiration))
                    .tokenStatus(TokenStatus.ACTIVE)
                    .build();

            tokenRepository.save(newToken);
        } catch (Exception e) {
            log.error("Error saving token", e);
            throw new RuntimeException("Error saving token", e);
        }
    }
}
