package com.example.figure.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class OrderRequest {
    private ShippingInfo shippingInfo;
    private String paymentMethod;
    private List<ItemRequest> items;
    
    @Getter
@Setter
public static class ItemRequest {
    private Long figureId;
    private Integer quantity;
    private Double price;
}
    
    @Getter
    @Setter
    public static class ShippingInfo {
        private String name;        // Sửa từ fullName thành name
        private String phone;
        private String email;
        private String address;
        private String note;        // Thêm note
    }
}