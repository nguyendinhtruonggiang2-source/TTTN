package com.example.figure.repository;

import com.example.figure.entity.CartItem;
import com.example.figure.entity.Figure;
import com.example.figure.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUser(User user);
    
    Optional<CartItem> findByUserAndFigure(User user, Figure figure);
    
    void deleteByUser(User user);
    
    int countByUser(User user);
}