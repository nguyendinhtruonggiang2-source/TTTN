// controller/ReviewController.java
package com.example.figure.controller;

import com.example.figure.dto.ReviewDTO;
import com.example.figure.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @GetMapping("/figure/{figureId}")
    public ResponseEntity<?> getReviewsByFigure(
            @PathVariable Long figureId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer rating) {
        try {
            Page<ReviewDTO> reviews = reviewService.getReviewsByFigureId(figureId, page, size, rating);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/figure/{figureId}/user")
    public ResponseEntity<?> getUserReview(@PathVariable Long figureId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            ReviewDTO review = reviewService.getUserReview(figureId, username);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }
    
    @GetMapping("/figure/{figureId}/stats")
    public ResponseEntity<?> getReviewStats(@PathVariable Long figureId) {
        try {
            Map<String, Object> stats = reviewService.getReviewStats(figureId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            ReviewDTO review = reviewService.createReview(reviewDTO, username);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody ReviewDTO reviewDTO) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            ReviewDTO review = reviewService.updateReview(id, reviewDTO, username);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            reviewService.deleteReview(id, username);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeReview(@PathVariable Long id) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            reviewService.likeReview(id, username);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}