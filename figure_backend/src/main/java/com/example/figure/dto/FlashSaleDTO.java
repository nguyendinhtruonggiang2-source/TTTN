// dto/FlashSaleDTO.java
package com.example.figure.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FlashSaleDTO {
    private Long id;
    private FigureInfo figure;
    private Double salePrice;
    private Integer discountPercent;
    private Integer quantityLimit;
    private Integer soldQuantity;
    private Integer remainingQuantity;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isActive;
    private String status; // UPCOMING, ACTIVE, ENDED
    
    @Data
    public static class FigureInfo {
        private Long id;
        private String name;
        private String image;
        private Double originalPrice;
        private String series;
        private String manufacturer;
    }
}