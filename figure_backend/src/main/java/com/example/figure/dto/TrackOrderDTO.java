// dto/TrackOrderDTO.java
package com.example.figure.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TrackOrderDTO {
    private Long id;
    private String orderCode;
    private String status;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime estimatedDeliveryDate;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private List<TrackStatusDTO> timeline;
    private List<OrderItemDTO> items;
    
    @Data
    public static class TrackStatusDTO {
        private String status;
        private String label;
        private String description;
        private LocalDateTime time;
        private boolean completed;
        private boolean active;
    }
    
    @Data
    public static class OrderItemDTO {
        private String name;
        private String image;
        private Integer quantity;
        private Double price;
    }
}