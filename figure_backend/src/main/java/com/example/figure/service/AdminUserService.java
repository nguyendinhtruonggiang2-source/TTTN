package com.example.figure.service;

import com.example.figure.dto.UserDTO;
import com.example.figure.entity.Role;
import com.example.figure.entity.User;
import com.example.figure.repository.RoleRepository;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }
    
    public UserDTO updateUserRoles(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Set<Role> roles = roleNames.stream()
            .map(roleName -> roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
            .collect(Collectors.toSet());
        
        user.setRoles(roles);
        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }
    
    public UserDTO toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }
    
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }
    
    private UserDTO mapToDTO(User user) {
        UserDTO dto = UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .name(user.getName())
            .phone(user.getPhone())
            .address(user.getAddress())
            .enabled(user.isEnabled())
            .roles(user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet()))
            .status(user.isEnabled() ? "Active" : "Inactive")
            .build();
        return dto;
    }
}