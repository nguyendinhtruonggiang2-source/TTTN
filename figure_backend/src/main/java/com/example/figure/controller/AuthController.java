package com.example.figure.controller;

import com.example.figure.dto.AuthRequest;
import com.example.figure.dto.AuthResponse;
import com.example.figure.dto.RegisterRequest;
import com.example.figure.dto.ForgotPasswordRequest;
import com.example.figure.dto.ResetPasswordRequest;
import com.example.figure.entity.Role;
import com.example.figure.entity.User;
import com.example.figure.jwt.JwtService;
import com.example.figure.repository.RoleRepository;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder; // THÊM PasswordEncoder
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        System.out.println("Register request received: " + request); // LOG
        
        try {
            // VALIDATION
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            
            // Check if username already exists
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            
            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            
            // Tạo user mới
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword())); // QUAN TRỌNG: MÃ HÓA PASSWORD
            user.setName(request.getName());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            user.setEnabled(true);
            
            // Get or create USER role
            Role userRole = roleRepository.findByName("USER")
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName("USER");
                        return roleRepository.save(newRole);
                    });
            
            user.setRoles(new HashSet<>());
            user.getRoles().add(userRole);
            
            // Lưu user
            User savedUser = userRepository.save(user);
            System.out.println("User saved with ID: " + savedUser.getId()); // LOG
            
            // Lấy UserDetails để tạo token
            UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
            
            // Tạo JWT token
            String jwtToken = jwtService.generateToken(userDetails);
            
            // Tạo response
            AuthResponse response = new AuthResponse();
            response.setId(savedUser.getId());
            response.setUsername(savedUser.getUsername());
            response.setName(savedUser.getName());
            response.setEmail(savedUser.getEmail());
            response.setPhone(savedUser.getPhone());
            response.setAddress(savedUser.getAddress());
            response.setToken(jwtToken);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // LOG ERROR
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody AuthRequest request) {
        try {
            // Xác thực user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );
            
            // Lấy UserDetails
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Tạo JWT token
            String jwtToken = jwtService.generateToken(userDetails);
            
            // Lấy thông tin user từ database
            User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Tạo response
            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setPhone(user.getPhone());
            response.setAddress(user.getAddress());
            response.setToken(jwtToken);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String email = request.getEmail();
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email not found"));
            
            // Generate a 6-digit random code
            String resetCode = String.format("%06d", (int) (Math.random() * 900000) + 100000);
            
            // Save code with 10 minutes expiration
            user.setResetCode(resetCode);
            user.setResetCodeExpiry(java.time.LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
            
            // Log to console for local testing / verification
            System.out.println("=================================================");
            System.out.println("RESET CODE FOR EMAIL " + email + ": " + resetCode);
            System.out.println("=================================================");
            
            // Return response. Include code in response to make it easy for frontend testing/deployment
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Mã xác thực đặt lại mật khẩu đã được tạo.");
            response.put("email", email);
            response.put("resetCode", resetCode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            String email = request.getEmail();
            String resetCode = request.getResetCode();
            String newPassword = request.getNewPassword();
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (resetCode == null || resetCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Reset code is required");
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("New password is required");
            }
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email not found"));
            
            if (user.getResetCode() == null || !user.getResetCode().equals(resetCode)) {
                return ResponseEntity.badRequest().body("Mã xác thực không chính xác");
            }
            
            if (user.getResetCodeExpiry() == null || user.getResetCodeExpiry().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body("Mã xác thực đã hết hạn");
            }
            
            // Reset password
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setResetCode(null);
            user.setResetCodeExpiry(null);
            user = userRepository.save(user);
            
            // Load UserDetails & Generate Token to auto login
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            String jwtToken = jwtService.generateToken(userDetails);
            
            AuthResponse response = new AuthResponse();
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setPhone(user.getPhone());
            response.setAddress(user.getAddress());
            response.setToken(jwtToken);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(org.springframework.security.core.Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            java.util.Map<String, Object> profileData = new java.util.HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("username", user.getUsername());
            profileData.put("name", user.getName() != null ? user.getName() : "");
            profileData.put("email", user.getEmail() != null ? user.getEmail() : "");
            profileData.put("phone", user.getPhone() != null ? user.getPhone() : "");
            profileData.put("address", user.getAddress() != null ? user.getAddress() : "");
            profileData.put("notifyNewArticle", user.getNotifyNewArticle() != null ? user.getNotifyNewArticle() : true);
            profileData.put("notifyFlashSale", user.getNotifyFlashSale() != null ? user.getNotifyFlashSale() : true);
            profileData.put("notifyOrder", user.getNotifyOrder() != null ? user.getNotifyOrder() : true);
            profileData.put("notifyAiMessage", user.getNotifyAiMessage() != null ? user.getNotifyAiMessage() : true);
            
            return ResponseEntity.ok(profileData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, Object> request, org.springframework.security.core.Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (request.containsKey("name")) user.setName((String) request.get("name"));
            if (request.containsKey("phone")) user.setPhone((String) request.get("phone"));
            if (request.containsKey("address")) user.setAddress((String) request.get("address"));
            if (request.containsKey("email")) user.setEmail((String) request.get("email"));
            
            if (request.containsKey("notifyNewArticle")) {
                user.setNotifyNewArticle(Boolean.valueOf(request.get("notifyNewArticle").toString()));
            }
            if (request.containsKey("notifyFlashSale")) {
                user.setNotifyFlashSale(Boolean.valueOf(request.get("notifyFlashSale").toString()));
            }
            if (request.containsKey("notifyOrder")) {
                user.setNotifyOrder(Boolean.valueOf(request.get("notifyOrder").toString()));
            }
            if (request.containsKey("notifyAiMessage")) {
                user.setNotifyAiMessage(Boolean.valueOf(request.get("notifyAiMessage").toString()));
            }
            
            User saved = userRepository.save(user);
            
            java.util.Map<String, Object> profileData = new java.util.HashMap<>();
            profileData.put("id", saved.getId());
            profileData.put("username", saved.getUsername());
            profileData.put("name", saved.getName() != null ? saved.getName() : "");
            profileData.put("email", saved.getEmail() != null ? saved.getEmail() : "");
            profileData.put("phone", saved.getPhone() != null ? saved.getPhone() : "");
            profileData.put("address", saved.getAddress() != null ? saved.getAddress() : "");
            profileData.put("notifyNewArticle", saved.getNotifyNewArticle() != null ? saved.getNotifyNewArticle() : true);
            profileData.put("notifyFlashSale", saved.getNotifyFlashSale() != null ? saved.getNotifyFlashSale() : true);
            profileData.put("notifyOrder", saved.getNotifyOrder() != null ? saved.getNotifyOrder() : true);
            profileData.put("notifyAiMessage", saved.getNotifyAiMessage() != null ? saved.getNotifyAiMessage() : true);
            
            return ResponseEntity.ok(profileData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}