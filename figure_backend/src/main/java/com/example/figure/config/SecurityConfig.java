package com.example.figure.config;

import com.example.figure.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/figures/**").permitAll()
                .requestMatchers("/api/categories").permitAll()
                .requestMatchers("/api/test/**").permitAll()
                .requestMatchers("/api/posts/**").permitAll()
                .requestMatchers("/api/comments/post/**").permitAll()
                .requestMatchers("/api/branches/**").permitAll()
                .requestMatchers("/api/promotions/**").permitAll()
                .requestMatchers("/images/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/static/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // 👉 FLASH SALE ENDPOINTS - Public
                .requestMatchers("/api/flash-sale/**").permitAll()
                
                // 👉 REVIEW ENDPOINTS - Public cho GET, cần đăng nhập cho POST/PUT/DELETE
                .requestMatchers("/api/reviews/figure/**").permitAll()
                .requestMatchers("/api/reviews/**").authenticated()
                
                // 👉 NOTIFICATION ENDPOINTS - Yêu cầu đăng nhập
                .requestMatchers("/api/notifications/**").authenticated()
                
                // 👉 TRACK ORDER ENDPOINTS - Public
                .requestMatchers("/api/track-order/**").permitAll()
                
                // 👉 ADMIN DASHBOARD - Chỉ Admin
                .requestMatchers("/api/admin/dashboard/**").hasRole("ADMIN")
                
                // 👉 WISHLIST ENDPOINTS - Yêu cầu đăng nhập
                .requestMatchers("/api/wishlist/**").authenticated()
                
                // 👉 ADMIN ENDPOINTS - Chỉ Admin
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // 👉 USER ENDPOINTS - Yêu cầu đăng nhập
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/orders/**").authenticated()
                .requestMatchers("/api/user/**").authenticated()
                .requestMatchers("/api/cart/**").authenticated()
                .requestMatchers("/api/comments/**").authenticated()
                .requestMatchers("/api/upload/**").authenticated()
                
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}