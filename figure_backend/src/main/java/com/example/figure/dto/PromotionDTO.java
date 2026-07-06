package com.example.figure.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {
    private Long id;
    private String title;
    private String description;
    private Integer discount;
    private String code;
    private String image;
    private String type;
    private Boolean isFlashSale;
    private Boolean isVoucher;
    private String condition;
    private List<String> products;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime endTime;
    private Boolean isActive;
    private Integer displayOrder;
    private Integer usageLimit;
    private Integer usedCount;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Thời gian còn lại (tính bằng giây)
    private Long timeRemaining;
    
    // Trạng thái khuyến mãi
    private String status; // upcoming, active, expired
}