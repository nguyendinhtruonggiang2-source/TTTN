package com.example.figure.service;

import com.example.figure.dto.BranchDTO;
import com.example.figure.dto.CategoryDTO;
import com.example.figure.dto.ProductDTO;
import com.example.figure.entity.Branch;
import com.example.figure.entity.Category;
import com.example.figure.entity.Figure;
import com.example.figure.repository.BranchRepository;
import com.example.figure.repository.CategoryRepository;
import com.example.figure.repository.FigureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminProductService {
    
    private final FigureRepository figureRepository;
    private final CategoryRepository categoryRepository;
    private final BranchRepository branchRepository;  // Thêm BranchRepository
    
    public ProductDTO createProduct(ProductDTO dto) {
        Category category = null;
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            category = categoryRepository.findById(dto.getCategory().getId())
                .orElse(null);
        }
        
        // Thêm xử lý branch
        Branch branch = null;
        if (dto.getBranchId() != null) {
            branch = branchRepository.findById(dto.getBranchId())
                .orElse(null);
        } else if (dto.getBranch() != null && dto.getBranch().getId() != null) {
            branch = branchRepository.findById(dto.getBranch().getId())
                .orElse(null);
        }
        
        Figure figure = new Figure();
        figure.setName(dto.getName());
        figure.setSeries(dto.getSeries());
        figure.setManufacturer(dto.getManufacturer());
        figure.setType(dto.getType());
        figure.setPrice(dto.getPrice());
        figure.setQuantity(dto.getQuantity());
        figure.setScale(dto.getScale());
        figure.setReleaseDate(dto.getReleaseDate());
        figure.setDescription(dto.getDescription());
        figure.setImage(dto.getImage());
        figure.setImagesList(dto.getImagesList());
        figure.setVideoUrl(dto.getVideoUrl());
        figure.setCategory(category);
        figure.setBranch(branch);  // Set branch
        
        Figure saved = figureRepository.save(figure);
        return mapToDTO(saved);
    }
    
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Figure figure = figureRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        Category category = null;
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            category = categoryRepository.findById(dto.getCategory().getId())
                .orElse(null);
        }
        
        // Thêm xử lý branch
        Branch branch = null;
        if (dto.getBranchId() != null) {
            branch = branchRepository.findById(dto.getBranchId())
                .orElse(null);
        } else if (dto.getBranch() != null && dto.getBranch().getId() != null) {
            branch = branchRepository.findById(dto.getBranch().getId())
                .orElse(null);
        }
        
        figure.setName(dto.getName());
        figure.setSeries(dto.getSeries());
        figure.setManufacturer(dto.getManufacturer());
        figure.setType(dto.getType());
        figure.setPrice(dto.getPrice());
        figure.setQuantity(dto.getQuantity());
        figure.setScale(dto.getScale());
        figure.setReleaseDate(dto.getReleaseDate());
        figure.setDescription(dto.getDescription());
        figure.setImage(dto.getImage());
        figure.setImagesList(dto.getImagesList());
        figure.setVideoUrl(dto.getVideoUrl());
        figure.setCategory(category);
        figure.setBranch(branch);  // Update branch
        
        Figure updated = figureRepository.save(figure);
        return mapToDTO(updated);
    }
    
    public void deleteProduct(Long id) {
        if (!figureRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        figureRepository.deleteById(id);
    }
    
    public List<ProductDTO> getAllProducts() {
        return figureRepository.findAll().stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public ProductDTO getProductById(Long id) {
        Figure figure = figureRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDTO(figure);
    }
    
    private ProductDTO mapToDTO(Figure figure) {
        ProductDTO dto = new ProductDTO();
        dto.setId(figure.getId());
        dto.setName(figure.getName());
        dto.setSeries(figure.getSeries());
        dto.setManufacturer(figure.getManufacturer());
        dto.setType(figure.getType());
        dto.setPrice(figure.getPrice());
        dto.setQuantity(figure.getQuantity());
        dto.setScale(figure.getScale());
        dto.setReleaseDate(figure.getReleaseDate());
        dto.setDescription(figure.getDescription());
        dto.setImage(figure.getImage());
        dto.setImagesList(figure.getImagesList());
        dto.setVideoUrl(figure.getVideoUrl());
        dto.setCreatedAt(figure.getCreatedAt());
        dto.setUpdatedAt(figure.getUpdatedAt());
        
        if (figure.getCategory() != null) {
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setId(figure.getCategory().getId());
            categoryDTO.setName(figure.getCategory().getName());
            categoryDTO.setDescription(figure.getCategory().getDescription());
            dto.setCategory(categoryDTO);
        }
        
        // Thêm branch info
        if (figure.getBranch() != null) {
            BranchDTO branchDTO = new BranchDTO();
            branchDTO.setId(figure.getBranch().getId());
            branchDTO.setCode(figure.getBranch().getCode());
            branchDTO.setName(figure.getBranch().getName());
            branchDTO.setAddress(figure.getBranch().getAddress());
            branchDTO.setPhone(figure.getBranch().getPhone());
            branchDTO.setEmail(figure.getBranch().getEmail());
            branchDTO.setManager(figure.getBranch().getManager());
            branchDTO.setOpeningHours(figure.getBranch().getOpeningHours());
            branchDTO.setIsActive(figure.getBranch().getIsActive());
            dto.setBranch(branchDTO);
            dto.setBranchId(figure.getBranch().getId());  // Set branchId
        }
        
        return dto;
    }
}