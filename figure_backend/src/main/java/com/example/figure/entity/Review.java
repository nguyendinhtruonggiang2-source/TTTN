// entity/Review.java
package com.example.figure.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "figure_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "figure_id", nullable = false)
    private Figure figure;
    
    @Column(nullable = false)
    private Integer rating; // 1-5 sao
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(name = "images", columnDefinition = "TEXT")
    private String images; // JSON array of image URLs
    
    @Column(name = "likes")
    @Builder.Default
    private Integer likes = 0;
    
    @Column(name = "is_verified_purchase")
    private Boolean isVerifiedPurchase = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (likes == null) likes = 0;
        if (isVerifiedPurchase == null) isVerifiedPurchase = false;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}