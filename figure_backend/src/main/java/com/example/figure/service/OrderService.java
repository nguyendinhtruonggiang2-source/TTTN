// service/OrderService.java
package com.example.figure.service;

import com.example.figure.dto.OrderRequest;
import com.example.figure.entity.*;
import com.example.figure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FigureRepository figureRepository;
    private final CartService cartService;
    private final OrderItemRepository orderItemRepository;
    private final NotificationRepository notificationRepository;
    private final com.example.figure.websocket.NotificationWebSocketHandler notificationWebSocketHandler;
    private final EmailService emailService;
    
    @Transactional
    public Order createOrder(OrderRequest request, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String orderCode = "ORD" + System.currentTimeMillis();
        
        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setUser(user);
        order.setShippingName(request.getShippingInfo().getName());
        order.setShippingPhone(request.getShippingInfo().getPhone());
        order.setShippingEmail(request.getShippingInfo().getEmail());
        order.setShippingAddress(request.getShippingInfo().getAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        if ("banking".equalsIgnoreCase(request.getPaymentMethod())) {
            order.setStatus("WAITING_PAYMENT");
        } else {
            order.setStatus("PENDING");
        }
        
        if (request.getShippingInfo() != null) {
            order.setNote(request.getShippingInfo().getNote());
        }
        
        order.setTotalAmount(0.0);
        
        Order savedOrder = orderRepository.save(order);
        
        List<OrderItem> items = new ArrayList<>();
        double total = 0;
        
        for (OrderRequest.ItemRequest itemRequest : request.getItems()) {
            Figure figure = figureRepository.findById(itemRequest.getFigureId())
                .orElseThrow(() -> new RuntimeException("Figure not found: " + itemRequest.getFigureId()));
            
            if (figure.getQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Không đủ hàng cho: " + figure.getName());
            }
            
            figure.setQuantity(figure.getQuantity() - itemRequest.getQuantity());
            figureRepository.save(figure);
            
            OrderItem orderItem = new OrderItem();
            orderItem.setFigure(figure);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(itemRequest.getPrice());
            orderItem.setOrder(savedOrder);
            
            orderItemRepository.save(orderItem);
            items.add(orderItem);
            
            total += itemRequest.getPrice() * itemRequest.getQuantity();
        }
        
        savedOrder.setItems(items);
        savedOrder.setTotalAmount(total + 30000);
        
        Order finalOrder = orderRepository.save(savedOrder);
        cartService.clearCart(user);

        // Tạo thông báo cho Admin khi có đơn hàng mới
        try {
            User adminUser = userRepository.findByUsername("admin").orElse(null);
            if (adminUser != null && (adminUser.getNotifyOrder() == null || adminUser.getNotifyOrder())) {
                Notification notif = Notification.builder()
                        .user(adminUser)
                        .title("Đơn hàng mới!")
                        .content("Khách hàng " + (user.getName() != null ? user.getName() : user.getUsername()) + " vừa đặt đơn hàng mới: " + finalOrder.getOrderCode())
                        .type("ORDER")
                        .redirectUrl("/admin/orders")
                        .isRead(false)
                        .build();
                Notification savedNotif = notificationRepository.save(notif);
                
                // Gửi realtime qua WebSocket
                notificationWebSocketHandler.sendNotificationToUser("admin", savedNotif);
            }
        } catch (Exception e) {
            System.err.println("Error saving/pushing admin notification: " + e.getMessage());
        }
        
        // Gửi email xác nhận đặt hàng về gmail của khách hàng
        try {
            String recipientEmail = finalOrder.getShippingEmail();
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                recipientEmail = user.getEmail();
            }
            
            if (recipientEmail != null && !recipientEmail.trim().isEmpty()) {
                String subject = "[Figure Store] Xác nhận đơn hàng " + finalOrder.getOrderCode();
                
                // Xây dựng danh sách sản phẩm ở dạng HTML table row
                StringBuilder itemsHtml = new StringBuilder();
                for (OrderItem item : finalOrder.getItems()) {
                    itemsHtml.append("<tr>")
                            .append("<td style=\"padding: 10px; border: 1px solid #cbd5e1;\">").append(item.getFigure().getName()).append("</td>")
                            .append("<td style=\"padding: 10px; border: 1px solid #cbd5e1; text-align: center;\">").append(item.getQuantity()).append("</td>")
                            .append("<td style=\"padding: 10px; border: 1px solid #cbd5e1; text-align: right;\">")
                            .append(String.format("%,.0fđ", item.getPrice()))
                            .append("</td>")
                            .append("</tr>");
                }
                
                String paymentText = finalOrder.getPaymentMethod();
                if ("cod".equalsIgnoreCase(paymentText)) {
                    paymentText = "Thanh toán khi nhận hàng (COD)";
                } else if ("banking".equalsIgnoreCase(paymentText)) {
                    paymentText = "Chuyển khoản ngân hàng";
                } else if ("momo".equalsIgnoreCase(paymentText)) {
                    paymentText = "Ví điện tử MoMo";
                }
                
                String emailContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;\">" +
                        "    <h2 style=\"color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px;\">CẢM ƠN BẠN ĐÃ ĐẶT HÀNG!</h2>" +
                        "    <p>Xin chào <strong>" + finalOrder.getShippingName() + "</strong>,</p>" +
                        "    <p>Đơn hàng của bạn đã được tiếp nhận thành công. Dưới đây là thông tin chi tiết đơn hàng của bạn:</p>" +
                        "    " +
                        "    <div style=\"background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;\">" +
                        "        <p style=\"margin: 5px 0;\"><strong>Mã đơn hàng:</strong> " + finalOrder.getOrderCode() + "</p>" +
                        "        <p style=\"margin: 5px 0;\"><strong>Phương thức thanh toán:</strong> " + paymentText + "</p>" +
                        "        <p style=\"margin: 5px 0;\"><strong>Địa chỉ giao hàng:</strong> " + finalOrder.getShippingAddress() + "</p>" +
                        "        <p style=\"margin: 5px 0;\"><strong>Số điện thoại:</strong> " + finalOrder.getShippingPhone() + "</p>" +
                        "    </div>" +
                        "    " +
                        "    <table style=\"width: 100%; border-collapse: collapse; margin-top: 15px;\">" +
                        "        <thead>" +
                        "            <tr style=\"background-color: #e2e8f0; text-align: left;\">" +
                        "                <th style=\"padding: 10px; border: 1px solid #cbd5e1;\">Sản phẩm</th>" +
                        "                <th style=\"padding: 10px; border: 1px solid #cbd5e1; text-align: center;\">SL</th>" +
                        "                <th style=\"padding: 10px; border: 1px solid #cbd5e1; text-align: right;\">Đơn giá</th>" +
                        "            </tr>" +
                        "        </thead>" +
                        "        <tbody>" +
                        "            " + itemsHtml.toString() +
                        "        </tbody>" +
                        "    </table>" +
                        "    " +
                        "    <div style=\"margin-top: 15px; text-align: right; font-size: 16px;\">" +
                        "        <p style=\"margin: 5px 0;\"><strong>Phí vận chuyển:</strong> 30.000đ</p>" +
                        "        <p style=\"margin: 5px 0; font-size: 18px; color: #dc2626;\"><strong>Tổng cộng:</strong> " + String.format("%,.0fđ", finalOrder.getTotalAmount()) + "</p>" +
                        "    </div>" +
                        "    " +
                        "    <div style=\"border-top: 1px solid #e2e8f0; margin-top: 20px; padding-top: 15px; text-align: center; color: #64748b; font-size: 12px;\">" +
                        "        <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua nguyendinhtruonggiang2@gmail.com.</p>" +
                        "        <p>© 2026 Figure Store. All rights reserved.</p>" +
                        "    </div>" +
                        "</div>";
                
                emailService.sendEmail(recipientEmail, subject, emailContent);
            }
        } catch (Exception e) {
            System.err.println("Error sending order confirmation email: " + e.getMessage());
        }
        
        return finalOrder;
    }
    
    public List<Order> getUserOrders(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    // Lấy order thông thường (không lấy items)
    public Order getOrderDetail(Long id, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return orderRepository.findById(id)
            .filter(order -> order.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    // Lấy order kèm items và figure (dùng cho frontend)
    public Order getOrderDetailWithItems(Long id, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return orderRepository.findOrderWithItemsByIdAndUser(id, user)
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    @Transactional
    public void cancelOrder(Long id, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Order order = orderRepository.findById(id)
            .filter(o -> o.getUser().getId().equals(user.getId()))
            .orElseThrow(() -> new RuntimeException("Order not found"));
        
        String statusUpper = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
        if (!"PENDING".equals(statusUpper) && !"PROCESSING".equals(statusUpper)) {
            throw new RuntimeException("Chỉ có thể yêu cầu hủy đơn hàng đang chờ xác nhận hoặc đang xử lý");
        }
        
        order.setStatus("CANCELLING");
        orderRepository.save(order);
    }
}