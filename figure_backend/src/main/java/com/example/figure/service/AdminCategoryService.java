package com.example.figure.service;

import com.example.figure.dto.CategoryDTO;
import com.example.figure.entity.Category;
import com.example.figure.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Category already exists");
        }
        
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        
        Category saved = categoryRepository.save(category);
        return mapToDTO(saved);
    }
    
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getName().equals(dto.getName()) && 
            categoryRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Category name already exists");
        }
        
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        
        Category updated = categoryRepository.save(category);
        return mapToDTO(updated);
    }
    
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getFigures().isEmpty()) {
            throw new RuntimeException("Cannot delete category with products");
        }
        
        categoryRepository.delete(category);
    }
    
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToDTO(category);
    }
    
    private CategoryDTO mapToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setProductCount(category.getFigures() != null ? category.getFigures().size() : 0);
        return dto;
    }
}