package com.example.figure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "figures")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Figure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String series;
    private String manufacturer;
    private String type;
    private double price;
    private int quantity;
    private String scale;
    private LocalDate releaseDate;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String image;
    
    @Column(name = "images_list", columnDefinition = "TEXT")
    private String imagesList;
    
    @Column(name = "video_url")
    private String videoUrl;
    
    @Column(name = "original_price")
    private Double originalPrice;
    
    private Integer discount;
    
    @Column(name = "is_new")
    private Boolean isNew = false;
    
    @Column(name = "sold_count")
    private Integer soldCount = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "figures"})
    private Category category;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "figures"})
    private Branch branch;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (originalPrice == null) originalPrice = price;
        if (discount == null) discount = 0;
        if (isNew == null) isNew = false;
        if (soldCount == null) soldCount = 0;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSeries() { return series; }
    public String getManufacturer() { return manufacturer; }
    public String getType() { return type; }
    public double getPrice() { return price; }
    public int getQuantity() { return quantity; }
    public String getScale() { return scale; }
    public LocalDate getReleaseDate() { return releaseDate; }
    public String getDescription() { return description; }
    public String getImage() { return image; }
    public Double getOriginalPrice() { return originalPrice; }
    public Integer getDiscount() { return discount; }
    public Boolean getIsNew() { return isNew; }
    public Integer getSoldCount() { return soldCount; }
    public Category getCategory() { return category; }
    public Branch getBranch() { return branch; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSeries(String series) { this.series = series; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public void setType(String type) { this.type = type; }
    public void setPrice(double price) { this.price = price; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public void setScale(String scale) { this.scale = scale; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }
    public void setDescription(String description) { this.description = description; }
    public void setImage(String image) { this.image = image; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }
    public void setDiscount(Integer discount) { this.discount = discount; }
    public void setIsNew(Boolean isNew) { this.isNew = isNew; }
    public void setSoldCount(Integer soldCount) { this.soldCount = soldCount; }
    public void setCategory(Category category) { this.category = category; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getImagesList() { return imagesList; }
    public void setImagesList(String imagesList) { this.imagesList = imagesList; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    
    // Helper methods
    public Long getBranchId() {
        return branch != null ? branch.getId() : null;
    }
    
    public String getBranchName() {
        return branch != null ? branch.getName() : null;
    }
    
    public Long getCategoryId() {
        return category != null ? category.getId() : null;
    }
    
    public String getCategoryName() {
        return category != null ? category.getName() : null;
    }
    
    public double getDiscountedPrice() {
        if (discount != null && discount > 0) {
            return price * (1 - discount / 100.0);
        }
        return price;
    }
}