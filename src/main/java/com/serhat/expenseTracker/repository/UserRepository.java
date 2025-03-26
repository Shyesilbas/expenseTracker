package com.serhat.expenseTracker.repository;

import com.serhat.expenseTracker.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser,Long> {
    Optional<AppUser> findByUsername(String username);

    Optional<AppUser> findByEmailOrUsernameOrPhone(String email, String username, String phone);

    Optional<AppUser> findByEmail(String email);
}
