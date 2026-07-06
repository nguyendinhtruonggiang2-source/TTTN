// repository/NotificationRepository.java
package com.example.figure.repository;

import com.example.figure.entity.Notification;
import com.example.figure.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    int countByUserAndIsReadFalse(User user);
    
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user")
    void markAllAsRead(@Param("user") User user);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.user = :user AND n.isRead = true")
    void deleteAllRead(@Param("user") User user);
}