package com.example.figure.repository;

import com.example.figure.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
    
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.figures")
    java.util.List<Category> findAllWithFigures();
}