package com.example.figure.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    private String name;
    private String phone;
    private String address;
    private String avatar;
    
    @Column(name = "reset_code")
    private String resetCode;
    
    @Column(name = "reset_code_expiry")
    private LocalDateTime resetCodeExpiry;

    
    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "notify_new_article")
    private Boolean notifyNewArticle = true;

    @Column(name = "notify_flash_sale")
    private Boolean notifyFlashSale = true;

    @Column(name = "notify_order")
    private Boolean notifyOrder = true;

    @Column(name = "notify_ai_message")
    private Boolean notifyAiMessage = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (notifyNewArticle == null) notifyNewArticle = true;
        if (notifyFlashSale == null) notifyFlashSale = true;
        if (notifyOrder == null) notifyOrder = true;
        if (notifyAiMessage == null) notifyAiMessage = true;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getAvatar() { return avatar; }
    public String getResetCode() { return resetCode; }
    public LocalDateTime getResetCodeExpiry() { return resetCodeExpiry; }
    public boolean isEnabled() { return enabled; }
    public Boolean getNotifyNewArticle() { return notifyNewArticle == null ? true : notifyNewArticle; }
    public Boolean getNotifyFlashSale() { return notifyFlashSale == null ? true : notifyFlashSale; }
    public Boolean getNotifyOrder() { return notifyOrder == null ? true : notifyOrder; }
    public Boolean getNotifyAiMessage() { return notifyAiMessage == null ? true : notifyAiMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Set<Role> getRoles() { return roles; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setName(String name) { this.name = name; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setResetCode(String resetCode) { this.resetCode = resetCode; }
    public void setResetCodeExpiry(LocalDateTime resetCodeExpiry) { this.resetCodeExpiry = resetCodeExpiry; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public void setNotifyNewArticle(Boolean notifyNewArticle) { this.notifyNewArticle = notifyNewArticle; }
    public void setNotifyFlashSale(Boolean notifyFlashSale) { this.notifyFlashSale = notifyFlashSale; }
    public void setNotifyOrder(Boolean notifyOrder) { this.notifyOrder = notifyOrder; }
    public void setNotifyAiMessage(Boolean notifyAiMessage) { this.notifyAiMessage = notifyAiMessage; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    
    public String getFullName() {
        return name != null ? name : username;
    }
}