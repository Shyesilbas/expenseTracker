package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.exception.EmailExistException;
import com.serhat.expenseTracker.exception.PhoneExistsException;
import com.serhat.expenseTracker.exception.UsernameExists;
import com.serhat.expenseTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserValidationServiceImpl implements UserValidationService {
    private final UserRepository userRepository;
    @Override
    public void validateUserRegistration(RegisterRequest request) {
        Optional<AppUser> existingUser = userRepository.findByEmailOrUsername(
                request.email(),
                request.username()
        );

        existingUser.ifPresent(user -> {
            if (user.getEmail().equals(request.email())) {
                throw new EmailExistException("Email already exists!");
            }
            if (user.getUsername().equals(request.username())) {
                throw new UsernameExists("Username already exists!");
            }
        });
    }
}
