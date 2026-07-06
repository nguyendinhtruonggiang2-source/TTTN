// controller/OrderController.java
package com.example.figure.controller;

import com.example.figure.dto.OrderRequest;
import com.example.figure.dto.OrderResponse;
import com.example.figure.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String username = userDetails.getUsername();
        var order = orderService.createOrder(request, username);
        return ResponseEntity.ok(OrderResponse.fromEntity(order));
    }
    
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String username = userDetails.getUsername();
        var orders = orderService.getUserOrders(username);
        
        List<OrderResponse> responses = orders.stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String username = userDetails.getUsername();
        // Lấy order kèm items và figure
        var order = orderService.getOrderDetailWithItems(id, username);
        return ResponseEntity.ok(OrderResponse.fromEntity(order));
    }
    
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String username = userDetails.getUsername();
        orderService.cancelOrder(id, username);
        return ResponseEntity.ok().build();
    }
}