// service/WishlistService.java
package com.example.figure.service;

import com.example.figure.dto.WishlistDTO;
import com.example.figure.entity.Figure;
import com.example.figure.entity.User;
import com.example.figure.entity.Wishlist;
import com.example.figure.repository.FigureRepository;
import com.example.figure.repository.UserRepository;
import com.example.figure.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final FigureRepository figureRepository;
    
    // Lấy danh sách wishlist của user
    @Transactional(readOnly = true)
    public List<WishlistDTO> getUserWishlist(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Wishlist> wishlists = wishlistRepository.findByUserOrderByCreatedAtDesc(user);
        return wishlists.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Lấy danh sách wishlist có phân trang
    @Transactional(readOnly = true)
    public Page<WishlistDTO> getUserWishlistPaginated(String username, int page, int size) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Wishlist> wishlists = wishlistRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        
        return wishlists.map(this::convertToDTO);
    }
    
    // Thêm sản phẩm vào wishlist
    @Transactional
    public WishlistDTO addToWishlist(String username, Long figureId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Figure figure = figureRepository.findById(figureId)
            .orElseThrow(() -> new RuntimeException("Figure not found"));
        
        // Kiểm tra đã tồn tại chưa
        if (wishlistRepository.existsByUserAndFigureId(user, figureId)) {
            throw new RuntimeException("Sản phẩm đã có trong danh sách yêu thích");
        }
        
        Wishlist wishlist = Wishlist.builder()
            .user(user)
            .figure(figure)
            .build();
        
        Wishlist saved = wishlistRepository.save(wishlist);
        return convertToDTO(saved);
    }
    
    // Xóa sản phẩm khỏi wishlist
    @Transactional
    public void removeFromWishlist(String username, Long figureId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!wishlistRepository.existsByUserAndFigureId(user, figureId)) {
            throw new RuntimeException("Sản phẩm không có trong danh sách yêu thích");
        }
        
        wishlistRepository.deleteByUserAndFigureId(user, figureId);
    }
    
    // Kiểm tra sản phẩm có trong wishlist không
    @Transactional(readOnly = true)
    public boolean isInWishlist(String username, Long figureId) {
        User user = userRepository.findByUsername(username)
            .orElse(null);
        
        if (user == null) return false;
        
        return wishlistRepository.existsByUserAndFigureId(user, figureId);
    }
    
    // Đếm số lượng wishlist của user
    @Transactional(readOnly = true)
    public int getWishlistCount(String username) {
        User user = userRepository.findByUsername(username)
            .orElse(null);
        
        if (user == null) return 0;
        
        return wishlistRepository.countByUser(user);
    }
    
    // Chuyển đổi Entity sang DTO
    private WishlistDTO convertToDTO(Wishlist wishlist) {
        WishlistDTO dto = new WishlistDTO();
        dto.setId(wishlist.getId());
        dto.setUserId(wishlist.getUser().getId());
        dto.setUsername(wishlist.getUser().getUsername());
        dto.setCreatedAt(wishlist.getCreatedAt());
        
        Figure figure = wishlist.getFigure();
        WishlistDTO.FigureInfo figureInfo = new WishlistDTO.FigureInfo();
        figureInfo.setId(figure.getId());
        figureInfo.setName(figure.getName());
        figureInfo.setImage(figure.getImage());
        figureInfo.setPrice(figure.getPrice());
        figureInfo.setOriginalPrice(figure.getOriginalPrice() != null ? figure.getOriginalPrice() : figure.getPrice());
        figureInfo.setDiscount(figure.getDiscount());
        figureInfo.setQuantity(figure.getQuantity());
        figureInfo.setSeries(figure.getSeries());
        figureInfo.setManufacturer(figure.getManufacturer());
        figureInfo.setCategory(figure.getCategory() != null ? figure.getCategory().getName() : null);
        figureInfo.setIsNew(figure.getIsNew());
        figureInfo.setSoldCount(figure.getSoldCount() != null ? figure.getSoldCount() : 0);
        
        dto.setFigure(figureInfo);
        return dto;
    }
}