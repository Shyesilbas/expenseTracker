package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.dto.objects.UserDto;
import com.serhat.expenseTracker.dto.requests.RegisterRequest;
import com.serhat.expenseTracker.entity.AppUser;
import org.springframework.security.core.userdetails.UserDetails;

public interface UserService {
    AppUser getCurrentUser();
    UserDto userInfo();
    void saveUser(AppUser user);
    AppUser createUser(RegisterRequest request);
    void validateRegistration(RegisterRequest request);
    UserDetails loadUserByUsername(String username);
}
