package com.example.figure.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "figure_id", nullable = false)
    private Figure figure;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false)
    private Double price;
    
    // Getters
    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public Figure getFigure() { return figure; }
    public Integer getQuantity() { return quantity; }
    public Double getPrice() { return price; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setOrder(Order order) { this.order = order; }
    public void setFigure(Figure figure) { this.figure = figure; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setPrice(Double price) { this.price = price; }
}