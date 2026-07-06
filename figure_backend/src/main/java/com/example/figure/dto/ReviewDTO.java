// dto/ReviewDTO.java
package com.example.figure.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReviewDTO {
    private Long id;
    private Long userId;
    private String username;
    private String userAvatar;
    private Long figureId;
    private Integer rating;
    private String content;
    private List<String> images;
    private Integer likes;
    private Boolean isVerifiedPurchase;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean canEdit;
    private Boolean canDelete;
}