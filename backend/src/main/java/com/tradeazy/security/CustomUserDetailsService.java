package com.tradeazy.security;

import com.tradeazy.entity.User;
import com.tradeazy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Security calls loadUserByUsername() whenever it needs to:
 *   - Authenticate a login attempt (AuthService.login → AuthenticationManager)
 *   - Load a user during JWT filter processing (JwtAuthenticationFilter)
 *
 * We accept either email OR username as the "username" identifier.
 * This is why we call findByEmailOrUsername() instead of findByUsername().
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
    User user = userRepository.findByEmailOrUsername(identifier)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

    // Force-initialize the lazy roles collection while the session is still open
    user.getRoles().size();

    return new CustomUserDetails(user);
}
}