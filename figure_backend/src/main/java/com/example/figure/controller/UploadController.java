// controller/UploadController.java
package com.example.figure.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Kiểm tra file
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File is empty");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra kích thước file (50MB)
            if (file.getSize() > 50 * 1024 * 1024) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File size exceeds 50MB");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra định dạng file (Cho phép cả ảnh và video)
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Only image and video files are allowed");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Tạo thư mục upload theo ngày
            String dateFolder = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path uploadPath = Paths.get(uploadDir, dateFolder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Tạo tên file duy nhất
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // Lưu file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            // Trả về URL
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            String fileUrl = "/uploads/" + dateFolder + "/" + fileName;
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("fileName", fileName);
            response.put("filePath", filePath.toString());
            response.put("message", "Upload thành công");
            response.put("uploadedBy", username);
            
            System.out.println("✅ File uploaded: " + fileUrl + " by " + username);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Upload failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    
    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam("fileUrl") String fileUrl) {
        try {
            // Xóa file khi cần (tùy chọn)
            Path filePath = Paths.get("." + fileUrl);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}