// src/main/java/com/example/figure/repository/BranchRepository.java
package com.example.figure.repository;

import com.example.figure.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    Optional<Branch> findByCode(String code);
    List<Branch> findByIsActiveTrueOrderByDisplayOrderAsc();
    boolean existsByCode(String code);
}