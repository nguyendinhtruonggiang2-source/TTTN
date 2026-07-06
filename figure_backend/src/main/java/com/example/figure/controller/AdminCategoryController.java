package com.example.figure.controller;

import com.example.figure.dto.CategoryDTO;
import com.example.figure.service.AdminCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize; // Tạm comment
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')")  // TẠM COMMENT ĐỂ TEST
public class AdminCategoryController {
    
    private final AdminCategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        System.out.println("✅ GET /api/admin/categories called");
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategory(@PathVariable Long id) {
        System.out.println("✅ GET /api/admin/categories/" + id + " called");
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }
    
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
        System.out.println("✅ POST /api/admin/categories called");
        System.out.println("📥 Received data: " + dto);
        return ResponseEntity.ok(categoryService.createCategory(dto));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        System.out.println("✅ PUT /api/admin/categories/" + id + " called");
        System.out.println("📥 Received data: " + dto);
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        System.out.println("✅ DELETE /api/admin/categories/" + id + " called");
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}