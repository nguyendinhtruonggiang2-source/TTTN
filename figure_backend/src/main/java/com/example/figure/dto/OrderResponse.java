// dto/OrderResponse.java
package com.example.figure.dto;

import com.example.figure.entity.Order;
import com.example.figure.entity.OrderItem;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String status;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private String paymentMethod;
    private String note;
    
    private String shippingName;
    private String shippingPhone;
    private String shippingEmail;
    private String shippingAddress;
    
    private List<OrderItemResponse> items;
    
    @Data
    public static class OrderItemResponse {
        private Long id;
        private Integer quantity;
        private Double price;
        private Double subtotal;
        private FigureInfo figure;
    }
    
    @Data
    public static class FigureInfo {
        private Long id;
        private String name;
        private String image;  // 👈 SỬA: imageUrl -> image (cho đúng với Entity Figure)
        private String series;
        private String manufacturer;
        private Double price;
    }
    
    public static OrderResponse fromEntity(Order order) {
        if (order == null) return null;
        
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderCode(order.getOrderCode());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setNote(order.getNote());
        response.setShippingName(order.getShippingName());
        response.setShippingPhone(order.getShippingPhone());
        response.setShippingEmail(order.getShippingEmail());
        response.setShippingAddress(order.getShippingAddress());
        
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            response.setItems(order.getItems().stream()
                .map(OrderResponse::convertItemToDTO)
                .collect(Collectors.toList()));
        }
        
        return response;
    }
    
    private static OrderItemResponse convertItemToDTO(OrderItem item) {
        OrderItemResponse itemResponse = new OrderItemResponse();
        itemResponse.setId(item.getId());
        itemResponse.setQuantity(item.getQuantity());
        itemResponse.setPrice(item.getPrice());
        itemResponse.setSubtotal(item.getPrice() * item.getQuantity());
        
        if (item.getFigure() != null) {
            FigureInfo figureInfo = new FigureInfo();
            figureInfo.setId(item.getFigure().getId());
            figureInfo.setName(item.getFigure().getName());
            
            // 👉 SỬA: dùng getImage() thay vì getImageUrl()
            figureInfo.setImage(item.getFigure().getImage());  // Lấy từ field "image" của Figure
            
            figureInfo.setSeries(item.getFigure().getSeries());
            figureInfo.setManufacturer(item.getFigure().getManufacturer());
            figureInfo.setPrice(item.getFigure().getPrice());
            itemResponse.setFigure(figureInfo);
        }
        
        return itemResponse;
    }
}