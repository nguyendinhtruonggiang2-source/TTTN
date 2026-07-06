// dto/CommentDTO.java
package com.example.figure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String author;
    private String email;
    private String content;
    private Integer likes;
    private Long postId;
    private Long parentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isApproved;
    private List<CommentDTO> replies;
    private Boolean likedByUser;
}