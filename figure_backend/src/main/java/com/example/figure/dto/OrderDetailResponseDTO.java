// dto/OrderDetailResponseDTO.java
package com.example.figure.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDetailResponseDTO {
    private Long id;
    private String orderCode;
    private String status;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private String paymentMethod;
    private String note;
    
    // Thông tin giao hàng
    private String shippingName;
    private String shippingPhone;
    private String shippingEmail;
    private String shippingAddress;
    
    // Danh sách sản phẩm
    private List<OrderItemDTO> items;
    
    @Data
    public static class OrderItemDTO {
        private Long id;
        private Integer quantity;
        private Double price;
        private Double subtotal;
        private FigureInfoDTO figure;
    }
    
    @Data
    public static class FigureInfoDTO {
        private Long id;
        private String name;
        private String imageUrl;
        private String series;
        private String manufacturer;
        private Double price;
    }
}