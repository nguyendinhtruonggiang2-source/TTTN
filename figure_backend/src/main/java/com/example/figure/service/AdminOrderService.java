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
    private final com.example.figure.repository.NotificationRepository notificationRepository;
    private final com.example.figure.websocket.NotificationWebSocketHandler notificationWebSocketHandler;
    
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

        // Tạo thông báo cho khách hàng khi có cập nhật trạng thái đơn hàng
        try {
            if (updated.getUser() != null && (updated.getUser().getNotifyOrder() == null || updated.getUser().getNotifyOrder())) {
                com.example.figure.entity.Notification notif = com.example.figure.entity.Notification.builder()
                        .user(updated.getUser())
                        .title("Cập nhật đơn hàng")
                        .content("Đơn hàng " + updated.getOrderCode() + " của bạn đã được cập nhật thành: " + getStatusText(status))
                        .type("ORDER")
                        .redirectUrl("/orders/" + updated.getId())
                        .isRead(false)
                        .build();
                com.example.figure.entity.Notification savedNotif = notificationRepository.save(notif);
                
                // Gửi realtime qua WebSocket
                notificationWebSocketHandler.sendNotificationToUser(updated.getUser().getUsername(), savedNotif);
            }
        } catch (Exception e) {
            System.err.println("Error saving/pushing customer notification: " + e.getMessage());
        }

        return mapToDTO(updated);
    }

    private String getStatusText(String status) {
        if (status == null) return "N/A";
        switch (status.toLowerCase()) {
            case "pending": return "Chờ xác nhận";
            case "processing": return "Đang xử lý";
            case "shipped": return "Đang giao hàng";
            case "delivered": return "Đã giao hàng thành công";
            case "cancelled": return "Đã hủy";
            default: return status;
        }
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