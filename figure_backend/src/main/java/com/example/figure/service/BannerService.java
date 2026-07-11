package com.example.figure.service;

import com.example.figure.entity.Banner;
import com.example.figure.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {
    
    private final BannerRepository bannerRepository;
    
    @Transactional(readOnly = true)
    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }
    
    @Transactional(readOnly = true)
    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAsc();
    }
    
    @Transactional(readOnly = true)
    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
    }
    
    @Transactional
    public Banner saveBanner(Banner banner) {
        return bannerRepository.save(banner);
    }
    
    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}
