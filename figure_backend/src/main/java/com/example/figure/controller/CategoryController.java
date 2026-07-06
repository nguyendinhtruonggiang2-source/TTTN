package com.example.figure.controller;

import com.example.figure.dto.CategoryDTO;
import com.example.figure.service.AdminCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final AdminCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        System.out.println("✅ Public GET /api/categories called");
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}
