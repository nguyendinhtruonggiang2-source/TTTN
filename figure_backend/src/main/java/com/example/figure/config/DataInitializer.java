package com.example.figure.config;

import com.example.figure.entity.Role;
import com.example.figure.entity.User;
import com.example.figure.repository.RoleRepository;
import com.example.figure.repository.UserRepository;
import com.example.figure.service.FigureService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final FigureService figureService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔧 ==========================================");
        System.out.println("🔧 Starting application data initialization...");
        System.out.println("🔧 ==========================================");
        
        try {
            // 1. Khởi tạo roles
            initRoles();
            
            // 2. Tạo tài khoản admin mặc định
            initAdminUser();
            
            // 3. Đảm bảo tất cả figures có quantity > 0 và price > 0
            figureService.ensureAllFiguresHaveStock();
            
            System.out.println("✅ Data initialization completed successfully");
        } catch (Exception e) {
            System.err.println("❌ ERROR during data initialization: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("🔧 ==========================================");
        System.out.println("🔧 Application ready!");
        System.out.println("🔧 ==========================================");
    }
    
    private void initRoles() {
        System.out.println("🔧 Initializing roles...");
        
        List<String> roleNames = List.of("USER", "ADMIN", "GUEST");
        
        for (String roleName : roleNames) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
                System.out.println("   ✅ Created role: " + roleName);
            } else {
                System.out.println("   ℹ️ Role already exists: " + roleName);
            }
        }
        System.out.println("✅ Roles initialization completed");
    }
    
    private void initAdminUser() {
        System.out.println("🔧 Checking admin user...");
        
        String adminUsername = "admin";
        String adminEmail = "admin@figurestore.com";
        
        // Kiểm tra xem admin đã tồn tại chưa
        if (userRepository.findByUsername(adminUsername).isPresent()) {
            System.out.println("ℹ️ Admin user already exists: " + adminUsername);
            return;
        }
        
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            System.out.println("ℹ️ Admin email already exists: " + adminEmail);
            return;
        }
        
        try {
            // Tạo user admin
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123")); // Mật khẩu: admin123
            admin.setName("Admin System");
            admin.setPhone("0123456789");
            admin.setAddress("Admin Address");
            admin.setEnabled(true);
            
            // Thêm roles cho admin (cả ADMIN và USER)
            HashSet<Role> roles = new HashSet<>();
            
            roleRepository.findByName("ADMIN").ifPresentOrElse(
                role -> {
                    roles.add(role);
                    System.out.println("   ✅ Added ADMIN role");
                },
                () -> System.out.println("⚠️ ADMIN role not found, creating...")
            );
            
            roleRepository.findByName("USER").ifPresentOrElse(
                role -> {
                    roles.add(role);
                    System.out.println("   ✅ Added USER role");
                },
                () -> System.out.println("⚠️ USER role not found, creating...")
            );
            
            admin.setRoles(roles);
            
            // Lưu admin user
            userRepository.save(admin);
            
            System.out.println("✅ ==========================================");
            System.out.println("✅ DEFAULT ADMIN USER CREATED");
            System.out.println("✅ Username: admin");
            System.out.println("✅ Email: admin@figurestore.com");
            System.out.println("✅ Password: admin123");
            System.out.println("✅ ==========================================");
            
        } catch (Exception e) {
            System.err.println("❌ ERROR creating admin user: " + e.getMessage());
            throw e;
        }
    }
}