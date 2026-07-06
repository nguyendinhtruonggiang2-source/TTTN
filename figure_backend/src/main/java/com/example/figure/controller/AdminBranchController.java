// src/main/java/com/example/figure/controller/AdminBranchController.java
package com.example.figure.controller;

import com.example.figure.dto.BranchDTO;
import com.example.figure.service.AdminBranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/branches")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminBranchController {
    
    @Autowired
    private AdminBranchService branchService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BranchDTO>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<BranchDTO>> getActiveBranches() {
        return ResponseEntity.ok(branchService.getActiveBranches());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDTO> getBranchById(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDTO> createBranch(@RequestBody BranchDTO branchDTO) {
        return ResponseEntity.ok(branchService.createBranch(branchDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDTO> updateBranch(@PathVariable Long id, @RequestBody BranchDTO branchDTO) {
        return ResponseEntity.ok(branchService.updateBranch(id, branchDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchDTO> toggleBranchStatus(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.toggleBranchStatus(id));
    }
}