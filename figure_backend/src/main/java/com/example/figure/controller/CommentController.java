// controller/CommentController.java
package com.example.figure.controller;

import com.example.figure.dto.CommentDTO;
import com.example.figure.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentService commentService;
    
    // Lấy comments theo postId
    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPost(@PathVariable Long postId) {
        try {
            List<CommentDTO> comments = commentService.getCommentsByPostId(postId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Tạo comment mới
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody CommentDTO commentDTO) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            CommentDTO newComment = commentService.createComment(commentDTO, username);
            return ResponseEntity.ok(newComment);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Thích comment
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeComment(@PathVariable Long id) {
        try {
            commentService.likeComment(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Liked comment successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Xóa comment
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            commentService.deleteComment(id, username);
            return ResponseEntity.ok(Map.of("success", true, "message", "Comment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Đếm comments của post
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<?> countComments(@PathVariable Long postId) {
        try {
            int count = commentService.countCommentsByPostId(postId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}