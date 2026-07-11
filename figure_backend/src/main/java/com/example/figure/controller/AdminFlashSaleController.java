// controller/admin/AdminFlashSaleController.java
package com.example.figure.controller.admin;

import com.example.figure.dto.FlashSaleDTO;
import com.example.figure.entity.FlashSale;
import com.example.figure.entity.Figure;
import com.example.figure.repository.FlashSaleRepository;
import com.example.figure.repository.FigureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/flash-sale")
@RequiredArgsConstructor
public class AdminFlashSaleController {
    
    private final FlashSaleRepository flashSaleRepository;
    private final FigureRepository figureRepository;
    private final com.example.figure.repository.UserRepository userRepository;
    private final com.example.figure.repository.NotificationRepository notificationRepository;
    private final com.example.figure.websocket.NotificationWebSocketHandler notificationWebSocketHandler;
    
    // Lấy tất cả flash sale
    @GetMapping
    public ResponseEntity<?> getAllFlashSales() {
        try {
            List<FlashSale> flashSales = flashSaleRepository.findAll();
            List<FlashSaleDTO> dtos = flashSales.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Tạo flash sale mới
    @PostMapping
    public ResponseEntity<?> createFlashSale(@RequestBody Map<String, Object> request) {
        try {
            Long figureId = Long.valueOf(request.get("figureId").toString());
            Double salePrice = Double.valueOf(request.get("salePrice").toString());
            Integer discountPercent = Integer.valueOf(request.get("discountPercent").toString());
            Integer quantityLimit = Integer.valueOf(request.get("quantityLimit").toString());
            String startTimeStr = request.get("startTime").toString();
            String endTimeStr = request.get("endTime").toString();
            
            Figure figure = figureRepository.findById(figureId)
                .orElseThrow(() -> new RuntimeException("Figure not found"));
            
            FlashSale flashSale = FlashSale.builder()
                .figure(figure)
                .salePrice(salePrice)
                .discountPercent(discountPercent)
                .quantityLimit(quantityLimit)
                .soldQuantity(0)
                .startTime(LocalDateTime.parse(startTimeStr))
                .endTime(LocalDateTime.parse(endTimeStr))
                .isActive(true)
                .build();
            
            FlashSale saved = flashSaleRepository.save(flashSale);
            
            // Gửi thông báo flash sale mới cho tất cả các user chọn nhận thông báo flash sale
            try {
                notifyAllUsersAboutFlashSale(saved);
            } catch (Exception e) {
                System.err.println("Error pushing flash sale notification: " + e.getMessage());
            }
            
            return ResponseEntity.ok(convertToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Cập nhật flash sale
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFlashSale(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flash sale not found"));
            
            if (request.containsKey("salePrice")) {
                flashSale.setSalePrice(Double.valueOf(request.get("salePrice").toString()));
            }
            if (request.containsKey("discountPercent")) {
                flashSale.setDiscountPercent(Integer.valueOf(request.get("discountPercent").toString()));
            }
            if (request.containsKey("quantityLimit")) {
                flashSale.setQuantityLimit(Integer.valueOf(request.get("quantityLimit").toString()));
            }
            if (request.containsKey("startTime")) {
                flashSale.setStartTime(LocalDateTime.parse(request.get("startTime").toString()));
            }
            if (request.containsKey("endTime")) {
                flashSale.setEndTime(LocalDateTime.parse(request.get("endTime").toString()));
            }
            if (request.containsKey("isActive")) {
                flashSale.setIsActive(Boolean.valueOf(request.get("isActive").toString()));
            }
            
            FlashSale saved = flashSaleRepository.save(flashSale);
            return ResponseEntity.ok(convertToDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Xóa flash sale
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFlashSale(@PathVariable Long id) {
        try {
            flashSaleRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private FlashSaleDTO convertToDTO(FlashSale flashSale) {
        FlashSaleDTO dto = new FlashSaleDTO();
        dto.setId(flashSale.getId());
        dto.setSalePrice(flashSale.getSalePrice());
        dto.setDiscountPercent(flashSale.getDiscountPercent());
        dto.setQuantityLimit(flashSale.getQuantityLimit());
        dto.setSoldQuantity(flashSale.getSoldQuantity());
        dto.setRemainingQuantity(flashSale.getQuantityLimit() - flashSale.getSoldQuantity());
        dto.setStartTime(flashSale.getStartTime());
        dto.setEndTime(flashSale.getEndTime());
        dto.setIsActive(flashSale.getIsActive());
        
        FlashSaleDTO.FigureInfo figureInfo = new FlashSaleDTO.FigureInfo();
        figureInfo.setId(flashSale.getFigure().getId());
        figureInfo.setName(flashSale.getFigure().getName());
        figureInfo.setImage(flashSale.getFigure().getImage());
        figureInfo.setOriginalPrice(flashSale.getFigure().getPrice());
        figureInfo.setSeries(flashSale.getFigure().getSeries());
        figureInfo.setManufacturer(flashSale.getFigure().getManufacturer());
        dto.setFigure(figureInfo);
        
        return dto;
    }

    private void notifyAllUsersAboutFlashSale(FlashSale sale) {
        List<com.example.figure.entity.User> users = userRepository.findAll();
        for (com.example.figure.entity.User u : users) {
            // Kiểm tra tùy chọn nhận thông báo flash sale của user
            if (u.getNotifyFlashSale() != null && u.getNotifyFlashSale()) {
                com.example.figure.entity.Notification notif = com.example.figure.entity.Notification.builder()
                        .user(u)
                        .title("⚡ Flash Sale mới!")
                        .content("Sản phẩm " + sale.getFigure().getName() + " chuẩn bị Flash Sale giảm giá còn: " + sale.getSalePrice())
                        .type("PROMOTION")
                        .redirectUrl("/flash-sale")
                        .isRead(false)
                        .build();
                com.example.figure.entity.Notification savedNotif = notificationRepository.save(notif);
                
                // Gửi realtime qua websocket
                try {
                    notificationWebSocketHandler.sendNotificationToUser(u.getUsername(), savedNotif);
                } catch (Exception e) {
                    System.err.println("Error sending Flash Sale WS to " + u.getUsername() + ": " + e.getMessage());
                }
            }
        }
    }
}