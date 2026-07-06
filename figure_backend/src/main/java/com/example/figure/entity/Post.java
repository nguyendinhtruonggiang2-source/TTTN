package com.example.figure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(columnDefinition = "TEXT")
    private String excerpt;
    
    private String image;
    
    private String category;
    
    private String author;
    
    @Column(name = "author_avatar")
    private String authorAvatar;
    
    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();
    
    @Builder.Default
    private Integer views = 0;
    
    @Builder.Default
    private Integer likes = 0;
    
    @Builder.Default
    private Integer comments = 0;
    
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean featured = false;
    
    @Column(name = "is_hot")
    @Builder.Default
    private Boolean hot = false;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Quan hệ với Comment
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("post")
    @Builder.Default
    private List<Comment> commentList = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (publishedAt == null) {
            publishedAt = LocalDateTime.now();
        }
        if (views == null) views = 0;
        if (likes == null) likes = 0;
        if (comments == null) comments = 0;
        if (featured == null) featured = false;
        if (hot == null) hot = false;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}