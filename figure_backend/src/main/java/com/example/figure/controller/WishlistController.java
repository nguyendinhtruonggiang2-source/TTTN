// controller/WishlistController.java
package com.example.figure.controller;

import com.example.figure.dto.WishlistDTO;
import com.example.figure.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    
    private final WishlistService wishlistService;
    
    // Lấy danh sách wishlist
    @GetMapping
    public ResponseEntity<?> getWishlist() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            List<WishlistDTO> wishlist = wishlistService.getUserWishlist(username);
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Thêm vào wishlist
    @PostMapping("/add/{figureId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long figureId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            WishlistDTO wishlist = wishlistService.addToWishlist(username, figureId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã thêm vào danh sách yêu thích");
            response.put("data", wishlist);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    // Xóa khỏi wishlist
    @DeleteMapping("/remove/{figureId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long figureId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            wishlistService.removeFromWishlist(username, figureId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã xóa khỏi danh sách yêu thích");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    // Kiểm tra sản phẩm có trong wishlist không
    @GetMapping("/check/{figureId}")
    public ResponseEntity<?> checkInWishlist(@PathVariable Long figureId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            boolean isInWishlist = wishlistService.isInWishlist(username, figureId);
            return ResponseEntity.ok(Map.of("inWishlist", isInWishlist));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("inWishlist", false));
        }
    }
    
    // Lấy số lượng wishlist
    @GetMapping("/count")
    public ResponseEntity<?> getWishlistCount() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            int count = wishlistService.getWishlistCount(username);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("count", 0));
        }
    }
}