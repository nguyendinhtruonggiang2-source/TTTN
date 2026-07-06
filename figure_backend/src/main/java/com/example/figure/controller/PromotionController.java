package com.example.figure.controller;

import com.example.figure.dto.PromotionDTO;
import com.example.figure.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class PromotionController {
    
    private final PromotionService promotionService;
    
    // Lấy tất cả khuyến mãi đang hoạt động
    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }
    
    // Lấy flash sale đang diễn ra
    @GetMapping("/flash-sale")
    public ResponseEntity<List<PromotionDTO>> getActiveFlashSales() {
        return ResponseEntity.ok(promotionService.getActiveFlashSales());
    }
    
    // Lấy voucher đang hoạt động
    @GetMapping("/vouchers")
    public ResponseEntity<List<PromotionDTO>> getActiveVouchers() {
        return ResponseEntity.ok(promotionService.getActiveVouchers());
    }
    
    // Lấy chi tiết khuyến mãi
    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.getPromotionById(id));
    }
    
    // Áp dụng mã voucher
    @PostMapping("/validate")
    public ResponseEntity<?> validateVoucher(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            Double orderAmount = ((Number) request.get("orderAmount")).doubleValue();
            
            PromotionDTO promotion = promotionService.validateVoucher(code, orderAmount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("promotion", promotion);
            response.put("discountAmount", calculateDiscount(promotion, orderAmount));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private double calculateDiscount(PromotionDTO promotion, Double orderAmount) {
        double discount = orderAmount * promotion.getDiscount() / 100;
        if (promotion.getMaxDiscountAmount() != null && discount > promotion.getMaxDiscountAmount()) {
            discount = promotion.getMaxDiscountAmount();
        }
        return discount;
    }
}