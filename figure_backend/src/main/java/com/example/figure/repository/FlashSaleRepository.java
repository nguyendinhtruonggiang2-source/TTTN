// repository/FlashSaleRepository.java
package com.example.figure.repository;

import com.example.figure.entity.FlashSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {
    
    // Lấy flash sale đang diễn ra
    List<FlashSale> findByIsActiveTrueAndStartTimeBeforeAndEndTimeAfter(
        LocalDateTime now1, LocalDateTime now2);
    
    // Lấy flash sale sắp diễn ra
    List<FlashSale> findByIsActiveTrueAndStartTimeAfterOrderByStartTimeAsc(LocalDateTime now);
    
    // Lấy flash sale đã kết thúc
    List<FlashSale> findByIsActiveTrueAndEndTimeBeforeOrderByEndTimeDesc(LocalDateTime now);
    
    // Kiểm tra figure có trong flash sale không
    Optional<FlashSale> findByFigureIdAndIsActiveTrueAndStartTimeBeforeAndEndTimeAfter(
        Long figureId, LocalDateTime now1, LocalDateTime now2);
    
    // Lấy flash sale theo figureId
    Optional<FlashSale> findByFigureId(Long figureId);
    
    // Cập nhật số lượng đã bán
    @Modifying
    @Transactional
    @Query("UPDATE FlashSale f SET f.soldQuantity = f.soldQuantity + :quantity WHERE f.id = :id")
    void incrementSoldQuantity(@Param("id") Long id, @Param("quantity") Integer quantity);
    
    // Kiểm tra còn hàng không
    @Query("SELECT (f.quantityLimit - f.soldQuantity) FROM FlashSale f WHERE f.id = :id")
    Integer getRemainingQuantity(@Param("id") Long id);
}