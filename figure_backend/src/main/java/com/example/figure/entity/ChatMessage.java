package com.example.figure.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String sessionId; // Identifies the customer session (e.g. username or unique guest ID)
    private String sender; // "customer" or "admin"
    
    @Column(columnDefinition = "TEXT")
    private String text;
    
    private LocalDateTime createdAt;
    
    @Transient
    private Boolean isPreset = false;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getIsPreset() { return isPreset != null ? isPreset : false; }
    public void setIsPreset(Boolean isPreset) { this.isPreset = isPreset; }
}
