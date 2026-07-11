package com.example.figure.service;

import com.example.figure.dto.UserDTO;
import com.example.figure.entity.Role;
import com.example.figure.entity.User;
import com.example.figure.repository.RoleRepository;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;
    
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
            .map(roleName -> {
                String searchName = roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
                return roleRepository.findByName(searchName)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
            })
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
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if ("admin".equals(user.getUsername())) {
            throw new RuntimeException("Không thể xóa tài khoản admin chính");
        }

        // 1. Xóa giỏ hàng
        entityManager.createQuery("DELETE FROM CartItem c WHERE c.user = :user")
            .setParameter("user", user)
            .executeUpdate();

        // 2. Xóa danh sách yêu thích
        entityManager.createQuery("DELETE FROM Wishlist w WHERE w.user = :user")
            .setParameter("user", user)
            .executeUpdate();

        // 3. Xóa đánh giá
        entityManager.createQuery("DELETE FROM Review r WHERE r.user = :user")
            .setParameter("user", user)
            .executeUpdate();

        // 4. Xóa thông báo
        entityManager.createQuery("DELETE FROM Notification n WHERE n.user = :user")
            .setParameter("user", user)
            .executeUpdate();

        // 5. Xóa địa chỉ
        entityManager.createQuery("DELETE FROM Address a WHERE a.user = :user")
            .setParameter("user", user)
            .executeUpdate();

        // 6. Xóa chi tiết đơn hàng và đơn hàng
        entityManager.createQuery("DELETE FROM OrderItem oi WHERE oi.order IN (SELECT o FROM Order o WHERE o.user = :user)")
            .setParameter("user", user)
            .executeUpdate();
        entityManager.createQuery("DELETE FROM Order o WHERE o.user = :user")
            .setParameter("user", user)
            .executeUpdate();

        // 7. Xóa người dùng
        userRepository.delete(user);
    }

    public UserDTO createUser(UserDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        String rawPassword = dto.getPassword() != null && !dto.getPassword().trim().isEmpty() 
            ? dto.getPassword() 
            : "user123";
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setEnabled(true);
        
        Set<String> roleNames = dto.getRoles();
        if (roleNames == null || roleNames.isEmpty()) {
            roleNames = Set.of("USER");
        }
        Set<Role> roles = roleNames.stream()
            .map(roleName -> {
                String searchName = roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
                return roleRepository.findByName(searchName)
                    .orElseThrow(() -> new RuntimeException("Quyền không tồn tại: " + roleName));
            })
            .collect(Collectors.toSet());
        user.setRoles(roles);
        
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }
    
    public UserDTO updateUser(Long userId, UserDTO dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        if (!user.getUsername().equals(dto.getUsername()) && userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        
        // Không cho sửa username của admin chính để tránh mất quyền truy cập
        if (!user.getUsername().equals("admin") || dto.getUsername().equals("admin")) {
            user.setUsername(dto.getUsername());
        }
        
        user.setEmail(dto.getEmail());
        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        
        // Nếu có mật khẩu mới, cập nhật mật khẩu
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        }
        
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            Set<Role> roles = dto.getRoles().stream()
                .map(roleName -> {
                    String searchName = roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
                    return roleRepository.findByName(searchName)
                        .orElseThrow(() -> new RuntimeException("Quyền không tồn tại: " + roleName));
                })
                .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        
        User saved = userRepository.save(user);
        return mapToDTO(saved);
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