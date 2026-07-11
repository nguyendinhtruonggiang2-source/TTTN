package com.example.figure.controller.admin;

import com.example.figure.entity.Banner;
import com.example.figure.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {
    
    private final BannerService bannerService;
    
    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }
    
    @PostMapping
    public ResponseEntity<?> createBanner(@RequestBody Banner banner) {
        try {
            Banner saved = bannerService.saveBanner(banner);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
        try {
            Banner banner = bannerService.getBannerById(id);
            banner.setTitle(bannerDetails.getTitle());
            banner.setSubtitle(bannerDetails.getSubtitle());
            banner.setImageUrl(bannerDetails.getImageUrl());
            banner.setLinkUrl(bannerDetails.getLinkUrl());
            banner.setDisplayOrder(bannerDetails.getDisplayOrder());
            banner.setIsActive(bannerDetails.getIsActive());
            
            Banner updated = bannerService.saveBanner(banner);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        try {
            bannerService.deleteBanner(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
