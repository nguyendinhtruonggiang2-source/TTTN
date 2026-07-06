package com.example.figure.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String token;
}