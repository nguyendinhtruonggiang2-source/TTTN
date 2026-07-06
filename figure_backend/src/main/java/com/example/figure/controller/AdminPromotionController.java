package com.example.figure.controller;

import com.example.figure.dto.PromotionDTO;
import com.example.figure.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AdminPromotionController {
    
    private final PromotionService promotionService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.getPromotionById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody PromotionDTO promotionDTO) {
        return ResponseEntity.ok(promotionService.createPromotion(promotionDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable Long id, @RequestBody PromotionDTO promotionDTO) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, promotionDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> togglePromotionStatus(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.togglePromotionStatus(id));
    }
}