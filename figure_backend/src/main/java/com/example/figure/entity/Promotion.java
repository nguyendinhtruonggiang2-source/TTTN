package com.example.figure.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Integer discount; // Phần trăm giảm giá (0-100)
    
    private String code; // Mã khuyến mãi
    
    private String image;
    
    private String type; // sale, flashsale, freeship, bogo, voucher
    
    @Column(name = "is_flash_sale")
    private Boolean isFlashSale = false;
    
    @Column(name = "is_voucher")
    private Boolean isVoucher = false;
    
    @Column(name = "condition_text")
    private String condition; // Điều kiện áp dụng
    
    @ElementCollection
    @CollectionTable(name = "promotion_products", joinColumns = @JoinColumn(name = "promotion_id"))
    @Column(name = "product_name")
    private List<String> products = new ArrayList<>();
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "end_time")
    private LocalDateTime endTime; // Thời gian kết thúc flash sale
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "usage_limit")
    private Integer usageLimit = 0; // Giới hạn số lần sử dụng
    
    @Column(name = "used_count")
    private Integer usedCount = 0; // Số lần đã sử dụng
    
    @Column(name = "min_order_amount")
    private Double minOrderAmount = 0.0; // Đơn hàng tối thiểu
    
    @Column(name = "max_discount_amount")
    private Double maxDiscountAmount; // Giảm tối đa
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isFlashSale == null) isFlashSale = false;
        if (isVoucher == null) isVoucher = false;
        if (isActive == null) isActive = true;
        if (usageLimit == null) usageLimit = 0;
        if (usedCount == null) usedCount = 0;
        if (minOrderAmount == null) minOrderAmount = 0.0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}