package com.example.figure.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_code", unique = true, nullable = false)
    private String orderCode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "shipping_name", nullable = false)
    private String shippingName;
    
    @Column(name = "shipping_phone", nullable = false)
    private String shippingPhone;
    
    @Column(name = "shipping_email")
    private String shippingEmail;
    
    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;
    
    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;
    
    @Column(nullable = false)
    private String status = "PENDING";
    
    @Column(columnDefinition = "TEXT")
    private String note;
    
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (orderCode == null) {
            orderCode = "ORD" + System.currentTimeMillis();
        }
    }
    
    // Getters
    public Long getId() { return id; }
    public String getOrderCode() { return orderCode; }
    public User getUser() { return user; }
    public String getShippingName() { return shippingName; }
    public String getShippingPhone() { return shippingPhone; }
    public String getShippingEmail() { return shippingEmail; }
    public String getShippingAddress() { return shippingAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getStatus() { return status; }
    public String getNote() { return note; }
    public Double getTotalAmount() { return totalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItem> getItems() { return items; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
    public void setUser(User user) { this.user = user; }
    public void setShippingName(String shippingName) { this.shippingName = shippingName; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }
    public void setShippingEmail(String shippingEmail) { this.shippingEmail = shippingEmail; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setStatus(String status) { this.status = status; }
    public void setNote(String note) { this.note = note; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}