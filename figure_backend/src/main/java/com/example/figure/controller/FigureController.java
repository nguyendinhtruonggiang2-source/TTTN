package com.example.figure.controller;

import com.example.figure.entity.Figure;
import com.example.figure.service.FigureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/figures")
@RequiredArgsConstructor
public class FigureController {
    
    private final FigureService figureService;
    
    @GetMapping
    public ResponseEntity<?> getAllFigures() {
        try {
            System.out.println("🎯 GET /api/figures endpoint called at " + new Date());
            
            List<Figure> figures = figureService.getAllFigures();
            
            System.out.println("✅ Controller received " + figures.size() + " figures");
            System.out.println("✅ First figure: " + (figures.isEmpty() ? "No data" : figures.get(0).getName()));
            
            return ResponseEntity.ok(figures);
        } catch (Exception e) {
            System.err.println("🔥 CONTROLLER ERROR in getAllFigures(): " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("timestamp", new Date());
            error.put("status", 500);
            error.put("error", "Internal Server Error");
            error.put("message", e.getMessage());
            error.put("exception", e.getClass().getName());
            
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            error.put("trace", sw.toString());
            
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getFigureById(@PathVariable Long id) {
        try {
            System.out.println("🎯 GET /api/figures/" + id + " called");
            Figure figure = figureService.getFigureById(id);
            return ResponseEntity.ok(figure);
        } catch (RuntimeException e) {
            System.err.println("❌ Figure not found: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getFigureById: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchFigures(@RequestParam(required = false) String keyword) {
        try {
            System.out.println("🎯 GET /api/figures/search called with keyword: " + keyword);
            List<Figure> figures = figureService.searchFigures(keyword);
            return ResponseEntity.ok(figures);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in searchFigures: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Search failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // THÊM API LẤY SẢN PHẨM THEO CHI NHÁNH
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<?> getFiguresByBranch(@PathVariable Long branchId) {
        try {
            System.out.println("🎯 GET /api/figures/branch/" + branchId + " called");
            List<Figure> figures = figureService.getFiguresByBranch(branchId);
            return ResponseEntity.ok(figures);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getFiguresByBranch: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    @GetMapping("/series")
    public ResponseEntity<?> getAllSeries() {
        try {
            List<String> series = figureService.getAllSeries();
            return ResponseEntity.ok(series);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getAllSeries: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/manufacturers")
    public ResponseEntity<?> getAllManufacturers() {
        try {
            List<String> manufacturers = figureService.getAllManufacturers();
            return ResponseEntity.ok(manufacturers);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getAllManufacturers: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/types")
    public ResponseEntity<?> getAllTypes() {
        try {
            List<String> types = figureService.getAllTypes();
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getAllTypes: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/newest")
    public ResponseEntity<?> getNewestFigures() {
        try {
            List<Figure> figures = figureService.getNewestFigures();
            return ResponseEntity.ok(figures);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getNewestFigures: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/price/asc")
    public ResponseEntity<?> getFiguresByPriceAsc() {
        try {
            List<Figure> figures = figureService.getFiguresByPriceAsc();
            return ResponseEntity.ok(figures);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getFiguresByPriceAsc: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/price/desc")
    public ResponseEntity<?> getFiguresByPriceDesc() {
        try {
            List<Figure> figures = figureService.getFiguresByPriceDesc();
            return ResponseEntity.ok(figures);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in getFiguresByPriceDesc: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createFigure(@RequestBody Figure figure) {
        try {
            System.out.println("🎯 POST /api/figures called");
            Figure savedFigure = figureService.saveFigure(figure);
            return ResponseEntity.ok(savedFigure);
        } catch (Exception e) {
            System.err.println("🔥 ERROR in createFigure: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFigure(@PathVariable Long id, @RequestBody Figure figureDetails) {
        try {
            System.out.println("🎯 PUT /api/figures/" + id + " called");
            Figure figure = figureService.getFigureById(id);
            
            figure.setName(figureDetails.getName());
            figure.setSeries(figureDetails.getSeries());
            figure.setManufacturer(figureDetails.getManufacturer());
            figure.setType(figureDetails.getType());
            figure.setPrice(figureDetails.getPrice());
            figure.setQuantity(figureDetails.getQuantity());
            figure.setScale(figureDetails.getScale());
            figure.setReleaseDate(figureDetails.getReleaseDate());
            figure.setDescription(figureDetails.getDescription());
            figure.setImage(figureDetails.getImage());
            figure.setBranch(figureDetails.getBranch()); // Thêm cập nhật branch
            
            Figure updatedFigure = figureService.saveFigure(figure);
            return ResponseEntity.ok(updatedFigure);
        } catch (RuntimeException e) {
            System.err.println("❌ Figure not found for update: " + e.getMessage());
            return ResponseEntity.status(404).body("Figure not found: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("🔥 ERROR in updateFigure: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFigure(@PathVariable Long id) {
        try {
            System.out.println("🎯 DELETE /api/figures/" + id + " called");
            figureService.deleteFigure(id);
            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("❌ Figure not found for deletion: " + e.getMessage());
            return ResponseEntity.status(404).body("Figure not found: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("🔥 ERROR in deleteFigure: " + e.getMessage());
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}