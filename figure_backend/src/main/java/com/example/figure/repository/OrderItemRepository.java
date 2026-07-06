package com.example.figure.repository;

import com.example.figure.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Có thể thêm các query tùy chỉnh nếu cần
}