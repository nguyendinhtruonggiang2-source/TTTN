package com.example.figure.controller;

import com.example.figure.dto.NotificationDTO;
import com.example.figure.entity.Notification;
import com.example.figure.entity.User;
import com.example.figure.repository.NotificationRepository;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false, defaultValue = "all") String scope,
            Pageable pageable) {
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Page<Notification> page;
        if ("admin".equalsIgnoreCase(scope)) {
            page = notificationRepository.findAdminNotifications(user, pageable);
        } else if ("user".equalsIgnoreCase(scope)) {
            page = notificationRepository.findUserNotifications(user, pageable);
        } else {
            page = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }
        
        Page<NotificationDTO> dtoPage = page.map(this::convertToDTO);
        
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/count")
    public ResponseEntity<java.util.Map<String, Integer>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        int total = notificationRepository.countByUserAndIsReadFalse(user);
        int admin = notificationRepository.countAdminUnread(user);
        int userCount = notificationRepository.countUserUnread(user);
        
        java.util.Map<String, Integer> counts = new java.util.HashMap<>();
        counts.put("count", total);
        counts.put("total", total);
        counts.put("admin", admin);
        counts.put("user", userCount);
        
        return ResponseEntity.ok(counts);
    }

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        notificationRepository.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> deleteAllReadNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        notificationRepository.deleteAllRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notificationRepository.delete(notification);
        return ResponseEntity.ok().build();
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setTitle(notification.getTitle());
        dto.setContent(notification.getContent());
        dto.setType(notification.getType());
        dto.setRedirectUrl(notification.getRedirectUrl());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
