// dto/NotificationDTO.java
package com.example.figure.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String type;
    private String redirectUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}