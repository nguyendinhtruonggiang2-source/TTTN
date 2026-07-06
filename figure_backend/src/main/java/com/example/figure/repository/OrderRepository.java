// repository/OrderRepository.java
package com.example.figure.repository;

import com.example.figure.entity.Order;
import com.example.figure.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    List<Order> findByStatus(String status);
    
    Optional<Order> findByOrderCode(String orderCode);
    
    int countByUser(User user);
    
    Optional<Order> findByIdAndUser(Long id, User user);
    
    // Lấy order kèm items và figure (JOIN FETCH)
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.figure f " +
           "WHERE o.id = :orderId AND o.user = :user")
    Optional<Order> findOrderWithItemsByIdAndUser(@Param("orderId") Long orderId, @Param("user") User user);
}