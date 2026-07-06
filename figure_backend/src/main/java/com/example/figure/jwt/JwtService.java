package com.example.figure.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {
    
    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;
    
    @Value("${jwt.expiration:86400000}") // 24 giờ
    private long jwtExpiration;
    
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }
    
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        System.out.println("🔑 Generating JWT token for user: " + userDetails.getUsername());
        
        // Thêm roles vào claims
        String roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        
        // Xác định role chính (ADMIN hay USER)
        String mainRole = "USER";
        if (roles.contains("ROLE_ADMIN")) {
            mainRole = "ADMIN";
        }
        
        // Thêm thông tin vào claims
        extraClaims.put("roles", roles);
        extraClaims.put("role", mainRole); // Role chính
        extraClaims.put("username", userDetails.getUsername());
        
        String token = Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
        
        // Debug token
        System.out.println("✅ Token generated successfully");
        System.out.println("📝 Token preview: " + (token.length() > 50 ? token.substring(0, 50) + "..." : token));
        System.out.println("🔢 Token length: " + token.length());
        
        // Decode để xem payload (chỉ debug)
        try {
            String[] parts = token.split("\\.");
            if (parts.length == 3) {
                String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
                System.out.println("📋 Token payload: " + payload);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not decode token for debug");
        }
        
        return token;
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
    
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public Claims extractAllClaims(String token) {
        System.out.println("🔍 Extracting claims from token");
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            System.out.println("✅ Claims extracted successfully");
            System.out.println("📋 Claims: username=" + claims.getSubject() + 
                               ", role=" + claims.get("role", String.class) + 
                               ", roles=" + claims.get("roles", String.class));
            return claims;
        } catch (Exception e) {
            System.err.println("🔥 Error parsing JWT: " + e.getMessage());
            System.err.println("🔥 Token preview: " + (token.length() > 50 ? token.substring(0, 50) + "..." : token));
            throw e;
        }
    }
    
    private Key getSignInKey() {
        try {
            byte[] keyBytes;
            
            // Kiểm tra nếu secretKey là base64
            if (secretKey.matches("^[A-Za-z0-9+/]+={0,2}$")) {
                System.out.println("ℹ️ Using base64 decoded secret key");
                keyBytes = Base64.getDecoder().decode(secretKey);
            } else {
                System.out.println("ℹ️ Using string as secret key bytes");
                keyBytes = secretKey.getBytes();
            }
            
            // Đảm bảo key đủ dài cho HS256 (ít nhất 256 bits = 32 bytes)
            if (keyBytes.length < 32) {
                byte[] padded = new byte[32];
                System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
                keyBytes = padded;
            }
            
            Key key = Keys.hmacShaKeyFor(keyBytes);
            System.out.println("✅ Signing key created successfully");
            return key;
        } catch (Exception e) {
            System.err.println("🔥 Error creating signing key: " + e.getMessage());
            throw e;
        }
    }
}