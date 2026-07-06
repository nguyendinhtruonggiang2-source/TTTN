package com.example.figure.dto;

import com.example.figure.entity.Figure;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FigureResponse {
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
    private String image;  // Đổi từ imageUrl thành image
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor này vẫn giữ
    public FigureResponse(Figure figure) {
        this.id = figure.getId();
        this.name = figure.getName();
        this.series = figure.getSeries();
        this.manufacturer = figure.getManufacturer();
        this.type = figure.getType();
        this.price = figure.getPrice();
        this.quantity = figure.getQuantity();
        this.scale = figure.getScale();
        this.releaseDate = figure.getReleaseDate();
        this.description = figure.getDescription();
        this.image = figure.getImage();  // Đổi từ getImageUrl() thành getImage()
        this.createdAt = figure.getCreatedAt();
        this.updatedAt = figure.getUpdatedAt();
    }
    
    // THÊM method fromEntity() để tương thích với code
    public static FigureResponse fromEntity(Figure figure) {
        return new FigureResponse(figure);
    }
}