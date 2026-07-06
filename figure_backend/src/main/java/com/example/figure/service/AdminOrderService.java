package com.example.figure.service;

import com.example.figure.dto.OrderDTO;
import com.example.figure.dto.OrderItemDTO;
import com.example.figure.dto.UserDTO;
import com.example.figure.entity.Order;
import com.example.figure.entity.OrderItem;
import com.example.figure.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderService {
    
    private final OrderRepository orderRepository;
    
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToDTO(order);
    }
    
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        Order updated = orderRepository.save(order);
        return mapToDTO(updated);
    }
    
    private OrderDTO mapToDTO(Order order) {
        List<OrderItemDTO> itemDTOs = order.getItems().stream()
            .map(this::mapItemToDTO)
            .collect(Collectors.toList());
        
        UserDTO userDTO = null;
        if (order.getUser() != null) {
            userDTO = UserDTO.builder()
                .id(order.getUser().getId())
                .username(order.getUser().getUsername())
                .email(order.getUser().getEmail())
                .name(order.getUser().getName())
                .build();
        }
        
        OrderDTO dto = OrderDTO.builder()
            .id(order.getId())
            .orderCode(order.getOrderCode())
            .user(userDTO)
            .shippingName(order.getShippingName())
            .shippingPhone(order.getShippingPhone())
            .shippingEmail(order.getShippingEmail())
            .shippingAddress(order.getShippingAddress())
            .paymentMethod(order.getPaymentMethod())
            .status(order.getStatus())
            .note(order.getNote())
            .totalAmount(order.getTotalAmount())
            .createdAt(order.getCreatedAt())
            .items(itemDTOs)
            .build();
        
        return dto;
    }
    
    private OrderItemDTO mapItemToDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        if (item.getFigure() != null) {
            dto.setProductId(item.getFigure().getId());
            dto.setProductName(item.getFigure().getName());
        }
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        dto.setSubtotal(item.getQuantity() * item.getPrice());
        return dto;
    }
}