package com.example.figure.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private double price;
    private double subtotal;
}