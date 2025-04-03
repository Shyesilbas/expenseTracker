package com.serhat.expenseTracker.service.user;

import com.serhat.expenseTracker.entity.AppUser;
import com.serhat.expenseTracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;

@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentUserHolder {
    private final UserRepository userRepository;
    private final AppUser currentUser;

    @Autowired
    public CurrentUserHolder(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.currentUser = fetchCurrentUser();
    }

    public AppUser getCurrentUser() {
        if (currentUser == null) {
            throw new UsernameNotFoundException("No authenticated user found");
        }
        return currentUser;
    }

    private AppUser fetchCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetails userDetails) {
            return userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userDetails.getUsername()));
        }
        return null;
    }
}
