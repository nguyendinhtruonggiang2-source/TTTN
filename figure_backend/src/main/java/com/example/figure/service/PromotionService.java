package com.example.figure.service;

import com.example.figure.dto.PromotionDTO;
import com.example.figure.entity.Promotion;
import com.example.figure.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    
    private final PromotionRepository promotionRepository;
    
    // Lấy tất cả khuyến mãi đang hoạt động
    public List<PromotionDTO> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
            .stream()
            .map(p -> convertToDTO(p, now))
            .collect(Collectors.toList());
    }
    
    // Lấy flash sale đang diễn ra
    public List<PromotionDTO> getActiveFlashSales() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findActiveFlashSales(now)
            .stream()
            .map(p -> convertToDTO(p, now))
            .collect(Collectors.toList());
    }
    
    // Lấy voucher đang hoạt động
    public List<PromotionDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findActiveVouchers(now)
            .stream()
            .map(p -> convertToDTO(p, now))
            .collect(Collectors.toList());
    }
    
    // Lấy tất cả khuyến mãi (cho admin)
    public List<PromotionDTO> getAllPromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findAll()
            .stream()
            .map(p -> convertToDTO(p, now))
            .collect(Collectors.toList());
    }
    
    // Lấy khuyến mãi theo ID
    public PromotionDTO getPromotionById(Long id) {
        LocalDateTime now = LocalDateTime.now();
        Promotion promotion = promotionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
        return convertToDTO(promotion, now);
    }
    
    // Kiểm tra và áp dụng mã voucher
    public PromotionDTO validateVoucher(String code, Double orderAmount) {
        LocalDateTime now = LocalDateTime.now();
        Promotion promotion = promotionRepository.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không tồn tại"));
        
        // Kiểm tra khuyến mãi có active không
        if (!promotion.getIsActive()) {
            throw new RuntimeException("Mã khuyến mãi đã bị vô hiệu hóa");
        }
        
        // Kiểm tra thời gian
        if (promotion.getStartDate().isAfter(now)) {
            throw new RuntimeException("Mã khuyến mãi chưa đến hạn sử dụng");
        }
        if (promotion.getEndDate().isBefore(now)) {
            throw new RuntimeException("Mã khuyến mãi đã hết hạn");
        }
        
        // Kiểm tra số lần sử dụng
        if (promotion.getUsageLimit() > 0 && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new RuntimeException("Mã khuyến mãi đã hết lượt sử dụng");
        }
        
        // Kiểm tra giá trị đơn hàng tối thiểu
        if (orderAmount < promotion.getMinOrderAmount()) {
            throw new RuntimeException("Đơn hàng tối thiểu " + 
                String.format("%,.0f", promotion.getMinOrderAmount()) + "đ để áp dụng mã này");
        }
        
        return convertToDTO(promotion, now);
    }
    
    // Tăng số lần sử dụng voucher
    @Transactional
    public void incrementUsedCount(Long promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
            .orElseThrow(() -> new RuntimeException("Promotion not found"));
        promotion.setUsedCount(promotion.getUsedCount() + 1);
        promotionRepository.save(promotion);
    }
    
    // Tạo khuyến mãi mới (admin)
    @Transactional
    public PromotionDTO createPromotion(PromotionDTO dto) {
        if (promotionRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại");
        }
        
        Promotion promotion = new Promotion();
        promotion.setTitle(dto.getTitle());
        promotion.setDescription(dto.getDescription());
        promotion.setDiscount(dto.getDiscount());
        promotion.setCode(dto.getCode());
        promotion.setImage(dto.getImage());
        promotion.setType(dto.getType());
        promotion.setIsFlashSale(dto.getIsFlashSale());
        promotion.setIsVoucher(dto.getIsVoucher());
        promotion.setCondition(dto.getCondition());
        promotion.setProducts(dto.getProducts());
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        promotion.setEndTime(dto.getEndTime());
        promotion.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        promotion.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        promotion.setUsageLimit(dto.getUsageLimit() != null ? dto.getUsageLimit() : 0);
        promotion.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : 0);
        promotion.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        
        Promotion saved = promotionRepository.save(promotion);
        return convertToDTO(saved, LocalDateTime.now());
    }
    
    // Cập nhật khuyến mãi (admin)
    @Transactional
    public PromotionDTO updatePromotion(Long id, PromotionDTO dto) {
        Promotion promotion = promotionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
        
        // Kiểm tra code trùng (trừ chính nó)
        if (!promotion.getCode().equals(dto.getCode()) && 
            promotionRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại");
        }
        
        promotion.setTitle(dto.getTitle());
        promotion.setDescription(dto.getDescription());
        promotion.setDiscount(dto.getDiscount());
        promotion.setCode(dto.getCode());
        promotion.setImage(dto.getImage());
        promotion.setType(dto.getType());
        promotion.setIsFlashSale(dto.getIsFlashSale());
        promotion.setIsVoucher(dto.getIsVoucher());
        promotion.setCondition(dto.getCondition());
        promotion.setProducts(dto.getProducts());
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        promotion.setEndTime(dto.getEndTime());
        promotion.setIsActive(dto.getIsActive());
        promotion.setDisplayOrder(dto.getDisplayOrder());
        promotion.setUsageLimit(dto.getUsageLimit());
        promotion.setMinOrderAmount(dto.getMinOrderAmount());
        promotion.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        
        Promotion updated = promotionRepository.save(promotion);
        return convertToDTO(updated, LocalDateTime.now());
    }
    
    // Xóa khuyến mãi (admin)
    @Transactional
    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion not found with id: " + id);
        }
        promotionRepository.deleteById(id);
    }
    
    // Bật/tắt trạng thái
    @Transactional
    public PromotionDTO togglePromotionStatus(Long id) {
        Promotion promotion = promotionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
        promotion.setIsActive(!promotion.getIsActive());
        Promotion updated = promotionRepository.save(promotion);
        return convertToDTO(updated, LocalDateTime.now());
    }
    
    // Chuyển đổi sang DTO
    private PromotionDTO convertToDTO(Promotion promotion, LocalDateTime now) {
        PromotionDTO dto = PromotionDTO.builder()
            .id(promotion.getId())
            .title(promotion.getTitle())
            .description(promotion.getDescription())
            .discount(promotion.getDiscount())
            .code(promotion.getCode())
            .image(promotion.getImage())
            .type(promotion.getType())
            .isFlashSale(promotion.getIsFlashSale())
            .isVoucher(promotion.getIsVoucher())
            .condition(promotion.getCondition())
            .products(promotion.getProducts())
            .startDate(promotion.getStartDate())
            .endDate(promotion.getEndDate())
            .endTime(promotion.getEndTime())
            .isActive(promotion.getIsActive())
            .displayOrder(promotion.getDisplayOrder())
            .usageLimit(promotion.getUsageLimit())
            .usedCount(promotion.getUsedCount())
            .minOrderAmount(promotion.getMinOrderAmount())
            .maxDiscountAmount(promotion.getMaxDiscountAmount())
            .createdAt(promotion.getCreatedAt())
            .updatedAt(promotion.getUpdatedAt())
            .build();
        
        // Tính thời gian còn lại
        if (promotion.getIsFlashSale() && promotion.getEndTime() != null) {
            long remaining = java.time.Duration.between(now, promotion.getEndTime()).getSeconds();
            dto.setTimeRemaining(Math.max(0, remaining));
        }
        
        // Xác định trạng thái
        if (promotion.getStartDate().isAfter(now)) {
            dto.setStatus("upcoming");
        } else if (promotion.getEndDate().isBefore(now)) {
            dto.setStatus("expired");
        } else {
            dto.setStatus("active");
        }
        
        return dto;
    }
}