package com.example.figure.controller;

import com.example.figure.entity.CartItem;
import com.example.figure.entity.User;
import com.example.figure.repository.UserRepository;
import com.example.figure.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CartController {
    
    private final CartService cartService;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("🛒 GET /api/cart - User: " + 
                (userDetails != null ? userDetails.getUsername() : "null"));
            
            if (userDetails == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập để xem giỏ hàng"
                ));
            }
            
            User user = getUserFromUserDetails(userDetails);
            List<CartItem> cartItems = cartService.getCartItems(user);
            
            System.out.println("✅ Found " + cartItems.size() + " items in cart");
            return ResponseEntity.ok(cartItems);
            
        } catch (Exception e) {
            System.err.println("❌ Error getting cart: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Không thể lấy thông tin giỏ hàng"
            ));
        }
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("🛒 POST /api/cart/add - Request: " + request);
            System.out.println("🛒 User: " + (userDetails != null ? userDetails.getUsername() : "null"));
            
            // Kiểm tra authentication
            if (userDetails == null) {
                System.out.println("❌ User not authenticated");
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng"
                ));
            }
            
            // Kiểm tra request body
            if (request == null || request.isEmpty()) {
                System.out.println("❌ Request body is empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Yêu cầu không có dữ liệu"
                ));
            }
            
            System.out.println("🛒 Request keys: " + request.keySet());
            
            // Lấy figureId từ các key có thể
            Long figureId = null;
            String figureIdKey = null;
            
            // Kiểm tra các key có thể chứa figureId
            String[] possibleKeys = {"figureId", "productId", "figure_id", "product_id", "id"};
            
            for (String key : possibleKeys) {
                if (request.containsKey(key)) {
                    figureIdKey = key;
                    Object value = request.get(key);
                    System.out.println("🔍 Found key: " + key + " = " + value);
                    
                    try {
                        if (value instanceof Number) {
                            figureId = ((Number) value).longValue();
                        } else if (value instanceof String) {
                            figureId = Long.parseLong((String) value);
                        } else {
                            System.out.println("❌ Invalid figureId type for key " + key + ": " + value.getClass());
                            continue;
                        }
                        System.out.println("✅ Figure ID parsed: " + figureId + " from key: " + key);
                        break;
                    } catch (NumberFormatException e) {
                        System.err.println("❌ Error parsing figureId from key " + key + ": " + e.getMessage());
                        continue;
                    }
                }
            }
            
            if (figureId == null) {
                System.out.println("❌ No valid figureId found in request");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy ID sản phẩm hợp lệ. Vui lòng cung cấp figureId hoặc productId"
                ));
            }
            
            // Lấy quantity, mặc định là 1 nếu không có
            Integer quantity = 1;
            String quantityKey = null;
            
            // Kiểm tra các key có thể chứa quantity
            String[] qtyKeys = {"quantity", "qty", "amount"};
            for (String key : qtyKeys) {
                if (request.containsKey(key)) {
                    quantityKey = key;
                    Object qtyValue = request.get(key);
                    System.out.println("🔍 Found quantity key: " + key + " = " + qtyValue);
                    
                    try {
                        if (qtyValue instanceof Number) {
                            quantity = ((Number) qtyValue).intValue();
                        } else if (qtyValue instanceof String) {
                            quantity = Integer.parseInt((String) qtyValue);
                        }
                        if (quantity <= 0) {
                            quantity = 1;
                        }
                        System.out.println("✅ Quantity parsed: " + quantity + " from key: " + key);
                        break;
                    } catch (NumberFormatException e) {
                        System.out.println("⚠️ Invalid quantity format for key " + key + ", using default 1");
                        continue;
                    }
                }
            }
            
            User user = getUserFromUserDetails(userDetails);
            
            System.out.println("🛒 Adding to cart - User: " + user.getUsername() + 
                             ", Figure ID: " + figureId + ", Quantity: " + quantity);
            
            CartItem cartItem = cartService.addToCart(user, figureId, quantity);
            
            System.out.println("✅ Cart item added successfully - ID: " + cartItem.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã thêm vào giỏ hàng");
            response.put("cartItem", cartItem);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            System.err.println("❌ Invalid number format: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Dữ liệu số không hợp lệ"
            ));
        } catch (Exception e) {
            System.err.println("❌ Error adding to cart: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(@RequestParam Long figureId,
                                            @RequestParam Integer quantity,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập"
                ));
            }
            
            User user = getUserFromUserDetails(userDetails);
            CartItem cartItem = cartService.updateQuantity(user, figureId, quantity);
            
            return ResponseEntity.ok(cartItem);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/remove/{figureId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long figureId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập"
                ));
            }
            
            User user = getUserFromUserDetails(userDetails);
            cartService.removeFromCart(user, figureId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xóa sản phẩm khỏi giỏ hàng"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Vui lòng đăng nhập"
                ));
            }
            
            User user = getUserFromUserDetails(userDetails);
            cartService.clearCart(user);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xóa toàn bộ giỏ hàng"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getCartCount(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                // Trả về 0 nếu chưa đăng nhập
                return ResponseEntity.ok(Map.of("count", 0));
            }
            
            User user = getUserFromUserDetails(userDetails);
            int count = cartService.getCartCount(user);
            
            return ResponseEntity.ok(Map.of("count", count));
            
        } catch (Exception e) {
            // Trả về 0 nếu có lỗi
            return ResponseEntity.ok(Map.of("count", 0));
        }
    }
    
    @GetMapping("/total")
    public ResponseEntity<?> getCartTotal(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.ok(Map.of("total", 0.0));
            }
            
            User user = getUserFromUserDetails(userDetails);
            double total = cartService.getCartTotal(user);
            
            return ResponseEntity.ok(Map.of("total", total));
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("total", 0.0));
        }
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateCart(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "message", "Chưa đăng nhập"
                ));
            }
            
            User user = getUserFromUserDetails(userDetails);
            boolean isValid = cartService.validateCartForCheckout(user);
            
            return ResponseEntity.ok(Map.of(
                "valid", isValid,
                "message", isValid ? "Giỏ hàng hợp lệ" : "Giỏ hàng không hợp lệ"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "valid", false,
                "message", "Lỗi: " + e.getMessage()
            ));
        }
    }
    
    // Test endpoint để debug
    @PostMapping("/test")
    public ResponseEntity<?> testAdd(@RequestBody Map<String, Object> request) {
        System.out.println("🛒 TEST /api/cart/test - Request: " + request);
        System.out.println("🛒 Request headers: " + request.keySet());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Test endpoint working",
            "receivedData", request
        ));
    }
    
    private User getUserFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getUsername()));
    }
}