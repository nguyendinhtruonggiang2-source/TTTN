// src/main/java/com/example/figure/controller/BranchController.java
package com.example.figure.controller;

import com.example.figure.dto.BranchDTO;
import com.example.figure.service.AdminBranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "*", maxAge = 3600)
public class BranchController {
    
    @Autowired
    private AdminBranchService branchService;
    
    @GetMapping("/active")
    public ResponseEntity<List<BranchDTO>> getActiveBranches() {
        return ResponseEntity.ok(branchService.getActiveBranches());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BranchDTO> getBranchById(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }
}