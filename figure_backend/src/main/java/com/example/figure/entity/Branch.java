package com.example.figure.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "branches")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Branch {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String address;
    
    private String phone;
    private String email;
    private String manager;
    
    @Column(name = "opening_hours")
    private String openingHours;
    
    private String latitude;
    private String longitude;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url")
    private String imageUrl;
    
    @OneToMany(mappedBy = "branch", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("branch")
    private List<Figure> figures = new ArrayList<>();
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters
    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public String getManager() { return manager; }
    public String getOpeningHours() { return openingHours; }
    public String getLatitude() { return latitude; }
    public String getLongitude() { return longitude; }
    public Boolean getIsActive() { return isActive; }
    public Integer getDisplayOrder() { return displayOrder; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public List<Figure> getFigures() { return figures; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setCode(String code) { this.code = code; }
    public void setName(String name) { this.name = name; }
    public void setAddress(String address) { this.address = address; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setEmail(String email) { this.email = email; }
    public void setManager(String manager) { this.manager = manager; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
    public void setLatitude(String latitude) { this.latitude = latitude; }
    public void setLongitude(String longitude) { this.longitude = longitude; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public void setDescription(String description) { this.description = description; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setFigures(List<Figure> figures) { this.figures = figures; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}