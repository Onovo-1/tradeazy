package com.tradeazy.security;

import com.tradeazy.entity.User;
import com.tradeazy.entity.enums.UserStatus;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Adapts our User entity to Spring Security's UserDetails interface.
 *
 * Spring Security doesn't know about our User class — it only works with
 * UserDetails. This wrapper exposes the user's authorities and account status
 * in a form Spring understands.
 *
 * We keep a reference to the underlying User so services can do:
 *   User me = SecurityUtils.getCurrentUser();
 * ...and get the real entity back.
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    /**
     * Authorities granted to this user. Each role becomes "ROLE_BUYER", "ROLE_SELLER", or "ROLE_ADMIN".
     * Spring uses these for @PreAuthorize and hasRole(...) checks.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // We don't expire accounts (yet)
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.getStatus() != UserStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() == UserStatus.ACTIVE;
    }
}