package com.example.figure.repository;

import com.example.figure.entity.CartItem;
import com.example.figure.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findByUser(User user);
    
    Optional<CartItem> findByUserAndFigureId(User user, Long figureId);
    
    void deleteByUserAndFigureId(User user, Long figureId);
    
    void deleteByUser(User user);
    
    int countByUser(User user);
    
    @Query("SELECT SUM(ci.quantity) FROM CartItem ci WHERE ci.user = :user")
    Integer sumQuantityByUser(User user);
    
    @Query("SELECT SUM(ci.quantity * ci.figure.price) FROM CartItem ci WHERE ci.user = :user")
    Double calculateCartTotal(User user);
}