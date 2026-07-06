package com.example.figure.repository;

import com.example.figure.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    
    // Lấy khuyến mãi đang hoạt động
    List<Promotion> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    // Lấy khuyến mãi theo loại
    List<Promotion> findByTypeAndIsActiveTrueOrderByDisplayOrderAsc(String type);
    
    // Lấy flash sale đang diễn ra
    @Query("SELECT p FROM Promotion p WHERE p.isFlashSale = true AND p.isActive = true " +
           "AND p.startDate <= :now AND p.endDate >= :now ORDER BY p.displayOrder ASC")
    List<Promotion> findActiveFlashSales(LocalDateTime now);
    
    // Lấy voucher đang hoạt động
    @Query("SELECT p FROM Promotion p WHERE p.isVoucher = true AND p.isActive = true " +
           "AND p.startDate <= :now AND p.endDate >= :now AND (p.usageLimit = 0 OR p.usedCount < p.usageLimit)")
    List<Promotion> findActiveVouchers(LocalDateTime now);
    
    // Kiểm tra mã code đã tồn tại
    boolean existsByCode(String code);
    
    // Tìm theo code
    Optional<Promotion> findByCode(String code);
    
    // Lấy khuyến mãi sắp diễn ra
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.startDate > :now ORDER BY p.startDate ASC")
    List<Promotion> findUpcomingPromotions(LocalDateTime now);
    
    // Lấy khuyến mãi đã kết thúc
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.endDate < :now ORDER BY p.endDate DESC")
    List<Promotion> findExpiredPromotions(LocalDateTime now);
    
    // Phân trang
    Page<Promotion> findAll(Pageable pageable);
}