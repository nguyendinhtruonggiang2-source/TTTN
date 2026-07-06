// service/ReviewService.java
package com.example.figure.service;

import com.example.figure.dto.ReviewDTO;
import com.example.figure.entity.Figure;
import com.example.figure.entity.Review;
import com.example.figure.entity.User;
import com.example.figure.repository.FigureRepository;
import com.example.figure.repository.ReviewRepository;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final FigureRepository figureRepository;
    
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getReviewsByFigureId(Long figureId, int page, int size, Integer rating) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews;
        
        if (rating != null && rating > 0) {
            reviews = reviewRepository.findByFigureIdAndRating(figureId, rating, pageable);
        } else {
            reviews = reviewRepository.findByFigureIdOrderByCreatedAtDesc(figureId, pageable);
        }
        
        return reviews.map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public ReviewDTO getUserReview(Long figureId, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return null;
        
        return reviewRepository.findByUserIdAndFigureId(user.getId(), figureId)
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    @Transactional(readOnly = true)
    public boolean hasUserReviewed(Long figureId, String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return false;
        return reviewRepository.existsByUserIdAndFigureId(user.getId(), figureId);
    }
    
    @Transactional
    public ReviewDTO createReview(ReviewDTO reviewDTO, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Figure figure = figureRepository.findById(reviewDTO.getFigureId())
            .orElseThrow(() -> new RuntimeException("Figure not found"));
        
        if (reviewRepository.existsByUserIdAndFigureId(user.getId(), figure.getId())) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi");
        }
        
        Review review = Review.builder()
            .user(user)
            .figure(figure)
            .rating(reviewDTO.getRating())
            .content(reviewDTO.getContent())
            .images(reviewDTO.getImages() != null ? String.join(",", reviewDTO.getImages()) : null)
            .isVerifiedPurchase(checkVerifiedPurchase(user.getId(), figure.getId()))
            .build();
        
        Review saved = reviewRepository.save(review);
        return convertToDTO(saved);
    }
    
    @Transactional
    public ReviewDTO updateReview(Long reviewId, ReviewDTO reviewDTO, String username) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa đánh giá này");
        }
        
        review.setRating(reviewDTO.getRating());
        review.setContent(reviewDTO.getContent());
        review.setImages(reviewDTO.getImages() != null ? String.join(",", reviewDTO.getImages()) : null);
        
        Review saved = reviewRepository.save(review);
        return convertToDTO(saved);
    }
    
    @Transactional
    public void deleteReview(Long reviewId, String username) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        
        if (!review.getUser().getId().equals(user.getId()) && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }
        
        reviewRepository.delete(review);
    }
    
    @Transactional
    public void likeReview(Long reviewId, String username) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setLikes(review.getLikes() + 1);
        reviewRepository.save(review);
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getReviewStats(Long figureId) {
        Map<String, Object> stats = new HashMap<>();
        Double avg = reviewRepository.getAverageRatingByFigureId(figureId);
        stats.put("averageRating", avg != null ? avg : 0.0);
        stats.put("totalReviews", reviewRepository.getTotalReviewsByFigureId(figureId));
        
        List<Object[]> distribution = reviewRepository.getRatingDistribution(figureId);
        Map<Integer, Integer> ratingCount = new HashMap<>();
        for (int i = 1; i <= 5; i++) ratingCount.put(i, 0);
        
        for (Object[] row : distribution) {
            Integer rating = ((Number) row[0]).intValue();
            Long count = (Long) row[1];
            ratingCount.put(rating, count.intValue());
        }
        
        stats.put("ratingDistribution", ratingCount);
        return stats;
    }
    
    private boolean checkVerifiedPurchase(Long userId, Long figureId) {
        // Kiểm tra user đã mua sản phẩm này chưa
        // TODO: Implement logic kiểm tra order
        return true;
    }
    
    private ReviewDTO convertToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setUserId(review.getUser().getId());
        dto.setUsername(review.getUser().getUsername());
        dto.setFigureId(review.getFigure().getId());
        dto.setRating(review.getRating());
        dto.setContent(review.getContent());
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            dto.setImages(List.of(review.getImages().split(",")));
        } else {
            dto.setImages(new ArrayList<>());
        }
        dto.setLikes(review.getLikes());
        dto.setIsVerifiedPurchase(review.getIsVerifiedPurchase());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUpdatedAt(review.getUpdatedAt());
        dto.setCanEdit(true);
        dto.setCanDelete(true);
        return dto;
    }
}