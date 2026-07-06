// repository/ReviewRepository.java
package com.example.figure.repository;

import com.example.figure.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Page<Review> findByFigureIdOrderByCreatedAtDesc(Long figureId, Pageable pageable);
    
    Page<Review> findByFigureIdAndRating(Long figureId, Integer rating, Pageable pageable);
    
    Optional<Review> findByUserIdAndFigureId(Long userId, Long figureId);
    
    boolean existsByUserIdAndFigureId(Long userId, Long figureId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.figure.id = :figureId")
    Double getAverageRatingByFigureId(@Param("figureId") Long figureId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.figure.id = :figureId")
    Integer getTotalReviewsByFigureId(@Param("figureId") Long figureId);
    
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.figure.id = :figureId GROUP BY r.rating")
    List<Object[]> getRatingDistribution(@Param("figureId") Long figureId);
}