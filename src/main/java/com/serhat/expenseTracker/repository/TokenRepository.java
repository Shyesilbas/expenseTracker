package com.serhat.expenseTracker.repository;

import com.serhat.expenseTracker.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token,Long> {
    Optional<Token> findByToken(String token);

    Optional<Token> findByUsername(String username);
}
