package com.example.figure.controller;

import com.example.figure.dto.SeriesDTO;
import com.example.figure.service.AdminSeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
public class SeriesController {

    private final AdminSeriesService seriesService;

    @GetMapping
    public ResponseEntity<List<SeriesDTO>> getAllSeries() {
        System.out.println("✅ Public GET /api/series called");
        return ResponseEntity.ok(seriesService.getAllSeries());
    }
}
