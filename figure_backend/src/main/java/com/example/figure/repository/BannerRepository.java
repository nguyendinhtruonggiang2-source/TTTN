package com.example.figure.repository;

import com.example.figure.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<Banner> findAllByOrderByDisplayOrderAsc();
}
