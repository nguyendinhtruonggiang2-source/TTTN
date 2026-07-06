package com.example.figure.service;

import com.example.figure.entity.User;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("🔍 Loading user by username: " + username);
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
                System.err.println("❌ User not found: " + username);
                return new UsernameNotFoundException("User not found: " + username);
            });
        
        System.out.println("✅ User found: " + user.getUsername() + ", enabled: " + user.isEnabled());
        
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                    .collect(Collectors.toList()))
                .disabled(!user.isEnabled())
                .build();
    }
}