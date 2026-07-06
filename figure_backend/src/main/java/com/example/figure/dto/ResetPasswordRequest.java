package com.example.figure.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {
    private String email;
    private String resetCode;
    private String newPassword;
}
