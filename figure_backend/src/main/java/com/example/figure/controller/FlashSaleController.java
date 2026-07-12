// controller/FlashSaleController.java
package com.example.figure.controller;

import com.example.figure.dto.FlashSaleDTO;
import com.example.figure.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/flash-sale")
@RequiredArgsConstructor
public class FlashSaleController {
    
    private final FlashSaleService flashSaleService;
    
    // Lấy danh sách flash sale đang diễn ra
    @GetMapping("/active")
    public ResponseEntity<?> getActiveFlashSales() {
        try {
            List<FlashSaleDTO> flashSales = flashSaleService.getActiveFlashSales();
            return ResponseEntity.ok(flashSales);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Lấy tất cả danh sách flash sale
    @GetMapping("/all")
    public ResponseEntity<?> getAllFlashSales() {
        try {
            List<FlashSaleDTO> flashSales = flashSaleService.getAllFlashSales();
            return ResponseEntity.ok(flashSales);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Lấy danh sách flash sale sắp diễn ra
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingFlashSales() {
        try {
            List<FlashSaleDTO> flashSales = flashSaleService.getUpcomingFlashSales();
            return ResponseEntity.ok(flashSales);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Lấy flash sale theo figureId
    @GetMapping("/figure/{figureId}")
    public ResponseEntity<?> getFlashSaleByFigureId(@PathVariable Long figureId) {
        try {
            FlashSaleDTO flashSale = flashSaleService.getFlashSaleByFigureId(figureId);
            if (flashSale == null) {
                return ResponseEntity.ok(null);
            }
            return ResponseEntity.ok(flashSale);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Kiểm tra còn hàng
    @GetMapping("/{id}/remaining")
    public ResponseEntity<?> getRemainingQuantity(@PathVariable Long id) {
        try {
            Integer remaining = flashSaleService.getRemainingQuantity(id);
            return ResponseEntity.ok(Map.of("remaining", remaining));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}