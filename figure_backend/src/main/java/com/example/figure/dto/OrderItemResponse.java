package com.example.figure.dto;

import com.example.figure.entity.OrderItem;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemResponse {
    private Long id;
    private FigureResponse figure;
    private Integer quantity;
    private Double price;
    
    // Thêm static method fromEntity
    public static OrderItemResponse fromEntity(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice());
        
        // Nếu có Figure, convert sang FigureResponse
        if (orderItem.getFigure() != null) {
            response.setFigure(FigureResponse.fromEntity(orderItem.getFigure()));
        }
        
        return response;
    }
}