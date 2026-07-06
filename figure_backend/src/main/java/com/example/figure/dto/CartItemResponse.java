package com.example.figure.dto;

import com.example.figure.entity.CartItem;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private FigureResponse figure;
    private int quantity;
    private double itemTotal;
    
    public CartItemResponse(CartItem cartItem) {
        this.id = cartItem.getId();
        this.figure = new FigureResponse(cartItem.getFigure());
        this.quantity = cartItem.getQuantity();
        this.itemTotal = cartItem.getQuantity() * cartItem.getFigure().getPrice();
    }
}