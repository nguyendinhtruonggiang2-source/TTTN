package com.example.figure.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {
    private Long id;
    private Long userId;
    private String fullName;
    private String phone;
    private String address;
    private String ward;
    private String district;
    private String city;
    private Boolean isDefault;
    private String addressType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}