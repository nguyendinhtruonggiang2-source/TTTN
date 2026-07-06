package com.example.figure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private String orderCode;
    private UserDTO user;
    private String shippingName;
    private String shippingPhone;
    private String shippingEmail;
    private String shippingAddress;
    private String paymentMethod;
    private String status;
    private String note;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;
}