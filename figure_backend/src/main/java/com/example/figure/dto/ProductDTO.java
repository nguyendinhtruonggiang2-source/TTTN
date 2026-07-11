package com.example.figure.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String series;
    private String manufacturer;
    private String type;
    private double price;
    private int quantity;
    private String scale;
    private LocalDate releaseDate;
    private String description;
    private String image;
    private String imagesList;
    private String videoUrl;
    private CategoryDTO category;
    private BranchDTO branch;        // Thêm branch
    private Long branchId;           // Thêm branchId để dễ xử lý
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}