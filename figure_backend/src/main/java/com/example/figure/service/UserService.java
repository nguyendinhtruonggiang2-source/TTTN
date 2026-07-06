package com.example.figure.service;

import com.example.figure.entity.User;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // THÊM PHƯƠNG THỨC NÀY
    public User saveUser(User user) {
        // Mã hóa password trước khi lưu
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    // THÊM PHƯƠNG THỨC NÀY
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    // Các phương thức khác nếu có
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}