// dto/WishlistDTO.java
package com.example.figure.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WishlistDTO {
    private Long id;
    private Long userId;
    private String username;
    private FigureInfo figure;
    private LocalDateTime createdAt;
    
    @Data
    public static class FigureInfo {
        private Long id;
        private String name;
        private String image;
        private Double price;
        private Double originalPrice;
        private Integer discount;
        private Integer quantity;
        private String series;
        private String manufacturer;
        private String category;
        private Boolean isNew;
        private Integer soldCount;
    }
}