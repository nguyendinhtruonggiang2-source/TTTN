// repository/WishlistRepository.java
package com.example.figure.repository;

import com.example.figure.entity.Wishlist;
import com.example.figure.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    // Lấy danh sách wishlist của user
    List<Wishlist> findByUserOrderByCreatedAtDesc(User user);
    
    // Lấy danh sách wishlist của user có phân trang
    Page<Wishlist> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Kiểm tra sản phẩm đã có trong wishlist chưa
    boolean existsByUserAndFigureId(User user, Long figureId);
    
    // Tìm wishlist theo user và figureId
    Optional<Wishlist> findByUserAndFigureId(User user, Long figureId);
    
    // Xóa sản phẩm khỏi wishlist
    @Modifying
    @Transactional
    void deleteByUserAndFigureId(User user, Long figureId);
    
    // Đếm số lượng wishlist của user
    int countByUser(User user);
    
    // Xóa tất cả wishlist của user
    @Modifying
    @Transactional
    void deleteByUser(User user);
}