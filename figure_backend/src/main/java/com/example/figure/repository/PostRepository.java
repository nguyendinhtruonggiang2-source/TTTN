package com.example.figure.repository;

import com.example.figure.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByOrderByPublishedAtDesc(Pageable pageable);
    List<Post> findTop4ByOrderByPublishedAtDesc();
    List<Post> findTop4ByFeaturedTrueOrderByPublishedAtDesc();
    List<Post> findTop4ByHotTrueOrderByPublishedAtDesc();
    Page<Post> findByCategory(String category, Pageable pageable);
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content, Pageable pageable);
}