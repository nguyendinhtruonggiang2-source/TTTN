package com.example.figure.controller;

import com.example.figure.dto.SeriesDTO;
import com.example.figure.service.AdminSeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/series")
@RequiredArgsConstructor
public class AdminSeriesController {
    
    private final AdminSeriesService seriesService;
    
    @GetMapping
    public ResponseEntity<List<SeriesDTO>> getAllSeries() {
        System.out.println("✅ GET /api/admin/series called");
        return ResponseEntity.ok(seriesService.getAllSeries());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SeriesDTO> getSeries(@PathVariable Long id) {
        System.out.println("✅ GET /api/admin/series/" + id + " called");
        return ResponseEntity.ok(seriesService.getSeriesById(id));
    }
    
    @PostMapping
    public ResponseEntity<SeriesDTO> createSeries(@RequestBody SeriesDTO dto) {
        System.out.println("✅ POST /api/admin/series called");
        System.out.println("📥 Received data: " + dto);
        return ResponseEntity.ok(seriesService.createSeries(dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SeriesDTO> updateSeries(@PathVariable Long id, @RequestBody SeriesDTO dto) {
        System.out.println("✅ PUT /api/admin/series/" + id + " called");
        System.out.println("📥 Received data: " + dto);
        return ResponseEntity.ok(seriesService.updateSeries(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSeries(@PathVariable Long id) {
        System.out.println("✅ DELETE /api/admin/series/" + id + " called");
        seriesService.deleteSeries(id);
        return ResponseEntity.ok().build();
    }
}
