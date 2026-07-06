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
        order.setStatus("pending");
        
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
        
        if (!"pending".equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        }
        
        order.setStatus("cancelled");
        
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Figure figure = item.getFigure();
                figure.setQuantity(figure.getQuantity() + item.getQuantity());
                figureRepository.save(figure);
            }
        }
        
        orderRepository.save(order);
    }
}