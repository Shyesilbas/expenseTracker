package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.mapper.UserMapper;
import com.serhat.expenseTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserValidationService userValidationService;
    private final UserMapper userMapper;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public UserDto userInfo() {
        AppUser user = getCurrentUser();
        return new UserDto(
                user.getUsername(),
                user.getEmail(),
                user.getPhone()
        );
    }

    @Override
    public AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("No authenticated user found");
    }

    @Override
    public void saveUser(AppUser user) {
        userRepository.save(user);
    }

    public AppUser createUser(RegisterRequest request) {
        AppUser user = userMapper.toUser(request);
        saveUser(user);
        return user;
    }

    public void validateRegistration(RegisterRequest request){
        userValidationService.validateUserRegistration(request);
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
       return userDetailsService.loadUserByUsername(username);
    }
}
