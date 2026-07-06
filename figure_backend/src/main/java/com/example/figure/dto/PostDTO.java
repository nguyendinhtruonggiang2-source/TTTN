package com.example.figure.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String excerpt;
    private String image;
    private String category;
    private String author;
    private String authorAvatar;
    private List<String> tags;
    private Integer views;
    private Integer likes;
    private Integer comments;
    private Boolean featured;
    private Boolean hot;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}