// entity/FlashSale.java
package com.example.figure.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "flash_sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSale {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "figure_id", nullable = false)
    private Figure figure;
    
    @Column(name = "sale_price", nullable = false)
    private Double salePrice;
    
    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;
    
    @Column(name = "quantity_limit")
    private Integer quantityLimit;
    
    @Column(name = "sold_quantity")
    @Builder.Default
    private Integer soldQuantity = 0;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (soldQuantity == null) soldQuantity = 0;
        if (isActive == null) isActive = true;
    }
}