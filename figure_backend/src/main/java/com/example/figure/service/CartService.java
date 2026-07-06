package com.example.figure.service;

import com.example.figure.entity.CartItem;
import com.example.figure.entity.Figure;
import com.example.figure.entity.User;
import com.example.figure.repository.CartItemRepository;
import com.example.figure.repository.FigureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    private final FigureRepository figureRepository;
    private final FigureService figureService; // Thêm dependency này
    
    @Transactional
    public CartItem addToCart(User user, Long figureId, Integer quantity) {
        try {
            System.out.println("🛒 CartService.addToCart - User ID: " + user.getId() + 
                             ", Figure ID: " + figureId + ", Quantity: " + quantity);
            
            // Sử dụng FigureService để validate figure
            Figure figure = figureService.validateFigureForCart(figureId);
            
            System.out.println("✅ Figure validated: " + figure.getName() + 
                             ", Quantity: " + figure.getQuantity() + 
                             ", Price: " + figure.getPrice());
            
            // KHÔNG KIỂM TRA QUANTITY - LUÔN CHO PHÉP THÊM VÀO GIỎ
            // Chỉ kiểm tra số lượng hợp lệ
            if (quantity <= 0) {
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }
            
            // Kiểm tra xem đã có trong giỏ hàng chưa
            Optional<CartItem> existingItem = cartItemRepository.findByUserAndFigure(user, figure);
            
            if (existingItem.isPresent()) {
                // Cập nhật số lượng
                CartItem cartItem = existingItem.get();
                int newQuantity = cartItem.getQuantity() + quantity;
                
                cartItem.setQuantity(newQuantity);
                cartItem.setPrice(figure.getPrice()); // Cập nhật price mới nhất
                System.out.println("✅ Updated existing cart item, new quantity: " + newQuantity);
                return cartItemRepository.save(cartItem);
            } else {
                // Thêm mới
                CartItem cartItem = new CartItem();
                cartItem.setUser(user);
                cartItem.setFigure(figure);
                cartItem.setQuantity(quantity);
                cartItem.setPrice(figure.getPrice()); // Sử dụng price từ figure
                
                System.out.println("✅ Created new cart item for: " + figure.getName());
                return cartItemRepository.save(cartItem);
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.addToCart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Không thể thêm vào giỏ hàng: " + e.getMessage(), e);
        }
    }
    
    public List<CartItem> getCartItems(User user) {
        try {
            System.out.println("🛒 CartService.getCartItems - User ID: " + user.getId());
            List<CartItem> items = cartItemRepository.findByUser(user);
            System.out.println("✅ Found " + items.size() + " items in cart");
            return items;
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.getCartItems: " + e.getMessage());
            throw e;
        }
    }
    
    @Transactional
    public CartItem updateQuantity(User user, Long figureId, Integer quantity) {
        try {
            System.out.println("🛒 CartService.updateQuantity - User: " + user.getId() + 
                             ", Figure ID: " + figureId + ", New Quantity: " + quantity);
            
            // Sử dụng FigureService để validate figure
            Figure figure = figureService.validateFigureForCart(figureId);
            
            CartItem cartItem = cartItemRepository.findByUserAndFigure(user, figure)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng"));
            
            if (quantity <= 0) {
                cartItemRepository.delete(cartItem);
                throw new RuntimeException("Số lượng phải lớn hơn 0");
            }
            
            cartItem.setQuantity(quantity);
            cartItem.setPrice(figure.getPrice()); // Cập nhật price mới nhất
            System.out.println("✅ Updated quantity to: " + quantity);
            return cartItemRepository.save(cartItem);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.updateQuantity: " + e.getMessage());
            throw e;
        }
    }
    
    @Transactional
    public void removeFromCart(User user, Long figureId) {
        try {
            System.out.println("🛒 CartService.removeFromCart - User: " + user.getId() + 
                             ", Figure ID: " + figureId);
            
            Figure figure = figureRepository.findById(figureId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
            
            CartItem cartItem = cartItemRepository.findByUserAndFigure(user, figure)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng"));
            
            cartItemRepository.delete(cartItem);
            System.out.println("✅ Removed item from cart");
            
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.removeFromCart: " + e.getMessage());
            throw e;
        }
    }
    
    @Transactional
    public void clearCart(User user) {
        try {
            System.out.println("🛒 CartService.clearCart - User: " + user.getId());
            int count = cartItemRepository.countByUser(user);
            cartItemRepository.deleteByUser(user);
            System.out.println("✅ Cleared " + count + " items from cart");
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.clearCart: " + e.getMessage());
            throw e;
        }
    }
    
    public int getCartCount(User user) {
        try {
            int count = cartItemRepository.countByUser(user);
            System.out.println("🛒 CartService.getCartCount - User: " + user.getId() + 
                             ", Count: " + count);
            return count;
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.getCartCount: " + e.getMessage());
            return 0; // Trả về 0 nếu có lỗi
        }
    }
    
    public double getCartTotal(User user) {
        try {
            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            double total = cartItems.stream()
                    .mapToDouble(item -> {
                        Double price = item.getPrice();
                        return (price != null ? price : 0.0) * item.getQuantity();
                    })
                    .sum();
            
            System.out.println("🛒 CartService.getCartTotal - User: " + user.getId() + 
                             ", Total: " + total);
            return total;
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.getCartTotal: " + e.getMessage());
            return 0.0; // Trả về 0 nếu có lỗi
        }
    }
    
    public boolean validateCartForCheckout(User user) {
        try {
            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            System.out.println("🛒 CartService.validateCartForCheckout - User: " + user.getId() + 
                             ", Items count: " + cartItems.size());
            
            if (cartItems.isEmpty()) {
                System.out.println("❌ Cart is empty");
                return false;
            }
            
            // Kiểm tra tất cả sản phẩm trong giỏ hàng còn đủ tồn kho không
            for (CartItem item : cartItems) {
                Figure figure = item.getFigure();
                
                // Sử dụng FigureService để validate figure trước
                Figure validatedFigure = figureService.validateFigureForCart(figure.getId());
                
                // Đảm bảo quantity hợp lệ
                if (validatedFigure.getQuantity() < item.getQuantity()) {
                    System.out.println("❌ Insufficient stock for: " + validatedFigure.getName() + 
                                     ", Required: " + item.getQuantity() + 
                                     ", Available: " + validatedFigure.getQuantity());
                    return false;
                }
            }
            
            System.out.println("✅ Cart is valid for checkout");
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.validateCartForCheckout: " + e.getMessage());
            return false;
        }
    }
    
    // Method để đảm bảo tất cả figures có quantity > 0
    @Transactional
    public void ensureAllFiguresHaveStock() {
        try {
            System.out.println("🛒 CartService.ensureAllFiguresHaveStock called");
            
            // Chuyển việc này sang FigureService để xử lý
            figureService.ensureAllFiguresHaveStock();
            
            System.out.println("✅ CartService stock check completed");
        } catch (Exception e) {
            System.err.println("❌ ERROR in CartService.ensureAllFiguresHaveStock: " + e.getMessage());
            throw e;
        }
    }
    
    // Helper method để debug cart
    public void debugCart(User user) {
        try {
            System.out.println("🔍 DEBUG CART for User: " + user.getId());
            List<CartItem> items = cartItemRepository.findByUser(user);
            
            if (items.isEmpty()) {
                System.out.println("   Cart is empty");
                return;
            }
            
            for (CartItem item : items) {
                System.out.println("   - Item: " + item.getFigure().getName() + 
                                 ", Quantity: " + item.getQuantity() + 
                                 ", Price: " + item.getPrice() +
                                 ", Total: " + (item.getQuantity() * item.getPrice()));
            }
            
            double total = getCartTotal(user);
            System.out.println("   Total cart value: " + total);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR in debugCart: " + e.getMessage());
        }
    }
}