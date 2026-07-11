package com.example.figure.service;

import com.example.figure.dto.SeriesDTO;
import com.example.figure.entity.Series;
import com.example.figure.repository.SeriesRepository;
import com.example.figure.repository.FigureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminSeriesService {
    
    private final SeriesRepository seriesRepository;
    private final FigureRepository figureRepository;
    
    public SeriesDTO createSeries(SeriesDTO dto) {
        if (seriesRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Series already exists");
        }
        
        Series series = new Series();
        series.setName(dto.getName());
        series.setDescription(dto.getDescription());
        
        Series saved = seriesRepository.save(series);
        return mapToDTO(saved);
    }
    
    public SeriesDTO updateSeries(Long id, SeriesDTO dto) {
        Series series = seriesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Series not found"));
        
        if (!series.getName().equals(dto.getName()) && 
            seriesRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Series name already exists");
        }
        
        series.setName(dto.getName());
        series.setDescription(dto.getDescription());
        
        Series updated = seriesRepository.save(series);
        return mapToDTO(updated);
    }
    
    public void deleteSeries(Long id) {
        Series series = seriesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Series not found"));
        
        // Check if there are figures with this series name
        long count = figureRepository.countBySeries(series.getName());
        if (count > 0) {
            throw new RuntimeException("Cannot delete series linked to products");
        }
        
        seriesRepository.delete(series);
    }
    
    public List<SeriesDTO> getAllSeries() {
        return seriesRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public SeriesDTO getSeriesById(Long id) {
        Series series = seriesRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Series not found"));
        return mapToDTO(series);
    }
    
    private SeriesDTO mapToDTO(Series series) {
        SeriesDTO dto = new SeriesDTO();
        dto.setId(series.getId());
        dto.setName(series.getName());
        dto.setDescription(series.getDescription());
        
        // Count how many products are of this series name
        long count = figureRepository.countBySeries(series.getName());
        dto.setProductCount((int) count);
        
        return dto;
    }
}
