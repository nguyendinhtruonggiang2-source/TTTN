package com.example.figure.controller;

import com.example.figure.dto.AddressDTO;
import com.example.figure.entity.User;
import com.example.figure.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/addresses")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AddressController {
    
    private final AddressService addressService;
    
    // SỬA: Dùng @AuthenticationPrincipal UserDetails thay vì User
    @GetMapping
    public ResponseEntity<List<AddressDTO>> getUserAddresses(@AuthenticationPrincipal UserDetails userDetails) {
        // Lấy userId từ UserDetails
        String username = userDetails.getUsername();
        // Cần có method tìm User theo username
        return ResponseEntity.ok(addressService.getUserAddresses(username));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        return ResponseEntity.ok(addressService.getAddressById(id, username));
    }
    
    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody AddressDTO addressDTO, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            AddressDTO created = addressService.createAddress(username, addressDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("address", created);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody AddressDTO addressDTO, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            AddressDTO updated = addressService.updateAddress(id, username, addressDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("address", updated);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            addressService.deleteAddress(id, username);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Address deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PatchMapping("/{id}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            AddressDTO updated = addressService.setDefaultAddress(id, username);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("address", updated);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}