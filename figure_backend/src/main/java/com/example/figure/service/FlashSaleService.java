// service/FlashSaleService.java
package com.example.figure.service;

import com.example.figure.dto.FlashSaleDTO;
import com.example.figure.entity.FlashSale;
import com.example.figure.repository.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleService {
    
    private final FlashSaleRepository flashSaleRepository;
    
    // Lấy tất cả flash sale đang hoạt động
    @Transactional(readOnly = true)
    public List<FlashSaleDTO> getActiveFlashSales() {
        LocalDateTime now = LocalDateTime.now();
        List<FlashSale> flashSales = flashSaleRepository.findByIsActiveTrueAndStartTimeBeforeAndEndTimeAfter(now, now);
        
        return flashSales.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // Lấy tất cả flash sale (dành cho hiển thị demo)
    @Transactional(readOnly = true)
    public List<FlashSaleDTO> getAllFlashSales() {
        List<FlashSale> flashSales = flashSaleRepository.findAll();
        return flashSales.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Lấy flash sale sắp diễn ra
    @Transactional(readOnly = true)
    public List<FlashSaleDTO> getUpcomingFlashSales() {
        LocalDateTime now = LocalDateTime.now();
        List<FlashSale> flashSales = flashSaleRepository.findByIsActiveTrueAndStartTimeAfterOrderByStartTimeAsc(now);
        
        return flashSales.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Lấy chi tiết flash sale theo figureId
    @Transactional(readOnly = true)
    public FlashSaleDTO getFlashSaleByFigureId(Long figureId) {
        LocalDateTime now = LocalDateTime.now();
        return flashSaleRepository.findByFigureIdAndIsActiveTrueAndStartTimeBeforeAndEndTimeAfter(figureId, now, now)
            .map(this::convertToDTO)
            .orElse(null);
    }
    
    // Cập nhật số lượng đã bán
    @Transactional
    public void updateSoldQuantity(Long flashSaleId, Integer quantity) {
        flashSaleRepository.incrementSoldQuantity(flashSaleId, quantity);
    }
    
    // Kiểm tra còn hàng
    @Transactional(readOnly = true)
    public Integer getRemainingQuantity(Long flashSaleId) {
        return flashSaleRepository.getRemainingQuantity(flashSaleId);
    }
    
    // Chuyển đổi Entity sang DTO
    private FlashSaleDTO convertToDTO(FlashSale flashSale) {
        FlashSaleDTO dto = new FlashSaleDTO();
        dto.setId(flashSale.getId());
        dto.setSalePrice(flashSale.getSalePrice());
        dto.setDiscountPercent(flashSale.getDiscountPercent());
        dto.setQuantityLimit(flashSale.getQuantityLimit());
        dto.setSoldQuantity(flashSale.getSoldQuantity());
        dto.setStartTime(flashSale.getStartTime());
        dto.setEndTime(flashSale.getEndTime());
        dto.setIsActive(flashSale.getIsActive());
        
        // Tính số lượng còn lại
        Integer remaining = flashSale.getQuantityLimit() - flashSale.getSoldQuantity();
        dto.setRemainingQuantity(remaining > 0 ? remaining : 0);
        
        // Xác định trạng thái
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(flashSale.getStartTime())) {
            dto.setStatus("UPCOMING");
        } else if (now.isAfter(flashSale.getEndTime())) {
            dto.setStatus("ENDED");
        } else {
            dto.setStatus("ACTIVE");
        }
        
        // Thông tin figure
        if (flashSale.getFigure() != null) {
            FlashSaleDTO.FigureInfo figureInfo = new FlashSaleDTO.FigureInfo();
            figureInfo.setId(flashSale.getFigure().getId());
            figureInfo.setName(flashSale.getFigure().getName());
            figureInfo.setImage(flashSale.getFigure().getImage());
            figureInfo.setOriginalPrice(flashSale.getFigure().getPrice());
            figureInfo.setSeries(flashSale.getFigure().getSeries());
            figureInfo.setManufacturer(flashSale.getFigure().getManufacturer());
            dto.setFigure(figureInfo);
        }
        
        return dto;
    }
}