package com.example.figure.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    // Danh sách các endpoint KHÔNG cần authentication
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/auth/",           // Authentication endpoints
        "/api/figures",         // Public figure endpoints  
        "/api/categories",      // Public category endpoints (chỉ public GET)
        "/api/test",           // Test endpoints
        "/images",             // Image resources
        "/uploads",            // Uploads
        "/static",             // Static resources
        "/swagger-ui",         // Swagger UI
        "/v3/api-docs",        // API docs
        "/error"               // Error pages
    );
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String path = request.getServletPath();
        final String method = request.getMethod();
        
        System.out.println("🔍 JwtAuthFilter - " + method + " " + path);
        
        // 1. Kiểm tra nếu là OPTIONS request (preflight CORS) - bỏ qua
        if ("OPTIONS".equalsIgnoreCase(method)) {
            System.out.println("ℹ️ OPTIONS preflight request, skipping authentication");
            filterChain.doFilter(request, response);
            return;
        }
        
        // 2. Kiểm tra nếu là public path - bỏ qua authentication
        boolean isPublicPath = PUBLIC_PATHS.stream()
                .anyMatch(publicPath -> path.startsWith(publicPath));
        
        // 3. Phân biệt GET và POST/PUT/DELETE cho categories
        if (path.startsWith("/api/categories")) {
            // Chỉ cho phép GET không cần token, các method khác cần token
            if ("GET".equalsIgnoreCase(method)) {
                System.out.println("✅ Public GET categories, skipping authentication");
                filterChain.doFilter(request, response);
                return;
            }
        }
        
        if (isPublicPath && !path.startsWith("/api/categories")) {
            System.out.println("✅ Public path, skipping authentication: " + path);
            filterChain.doFilter(request, response);
            return;
        }
        
        // 4. Xử lý JWT cho các endpoint cần authentication
        final String authHeader = request.getHeader("Authorization");
        
        System.out.println("🔍 Authorization header: " + (authHeader != null ? "PRESENT" : "NULL"));
        
        // Kiểm tra header Authorization
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("⚠️ No Bearer token for protected endpoint: " + path);
            
            // Trả về 401 cho các endpoint bảo vệ mà không có token
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Authentication required\"}");
            return;
        }
        
        final String jwt = authHeader.substring(7);
        
        // Kiểm tra token không rỗng
        if (jwt == null || jwt.trim().isEmpty()) {
            System.out.println("⚠️ Token is empty after 'Bearer ' prefix");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Invalid token format\"}");
            return;
        }
        
        try {
            final String userEmail = jwtService.extractUsername(jwt);
            System.out.println("✅ Extracted username: " + userEmail);
            
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("✅ Authentication set for user: " + userEmail);
                    System.out.println("✅ User authorities: " + userDetails.getAuthorities());
                } else {
                    System.out.println("❌ Token is invalid or expired");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\": \"Token expired or invalid\"}");
                    return;
                }
            }
        } catch (Exception e) {
            System.out.println("❌ JWT processing error: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Authentication failed: " + e.getMessage() + "\"}");
            return;
        }
        
        filterChain.doFilter(request, response);
    }
}