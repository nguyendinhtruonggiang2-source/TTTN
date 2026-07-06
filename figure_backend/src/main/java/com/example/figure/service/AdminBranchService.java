// src/main/java/com/example/figure/service/AdminBranchService.java
package com.example.figure.service;

import com.example.figure.dto.BranchDTO;
import com.example.figure.entity.Branch;
import com.example.figure.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminBranchService {
    
    @Autowired
    private BranchRepository branchRepository;
    
    public List<BranchDTO> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<BranchDTO> getActiveBranches() {
        return branchRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public BranchDTO getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        return convertToDTO(branch);
    }
    
    @Transactional
    public BranchDTO createBranch(BranchDTO branchDTO) {
        if (branchRepository.existsByCode(branchDTO.getCode())) {
            throw new RuntimeException("Branch code already exists: " + branchDTO.getCode());
        }
        
        Branch branch = new Branch();
        branch.setCode(branchDTO.getCode());
        branch.setName(branchDTO.getName());
        branch.setAddress(branchDTO.getAddress());
        branch.setPhone(branchDTO.getPhone());
        branch.setEmail(branchDTO.getEmail());
        branch.setManager(branchDTO.getManager());
        branch.setOpeningHours(branchDTO.getOpeningHours());
        branch.setLatitude(branchDTO.getLatitude());
        branch.setLongitude(branchDTO.getLongitude());
        branch.setIsActive(branchDTO.getIsActive() != null ? branchDTO.getIsActive() : true);
        branch.setDisplayOrder(branchDTO.getDisplayOrder() != null ? branchDTO.getDisplayOrder() : 0);
        branch.setDescription(branchDTO.getDescription());
        branch.setImageUrl(branchDTO.getImageUrl());
        
        Branch saved = branchRepository.save(branch);
        return convertToDTO(saved);
    }
    
    @Transactional
    public BranchDTO updateBranch(Long id, BranchDTO branchDTO) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        
        if (!branch.getCode().equals(branchDTO.getCode()) && 
            branchRepository.existsByCode(branchDTO.getCode())) {
            throw new RuntimeException("Branch code already exists: " + branchDTO.getCode());
        }
        
        branch.setCode(branchDTO.getCode());
        branch.setName(branchDTO.getName());
        branch.setAddress(branchDTO.getAddress());
        branch.setPhone(branchDTO.getPhone());
        branch.setEmail(branchDTO.getEmail());
        branch.setManager(branchDTO.getManager());
        branch.setOpeningHours(branchDTO.getOpeningHours());
        branch.setLatitude(branchDTO.getLatitude());
        branch.setLongitude(branchDTO.getLongitude());
        branch.setIsActive(branchDTO.getIsActive());
        branch.setDisplayOrder(branchDTO.getDisplayOrder());
        branch.setDescription(branchDTO.getDescription());
        branch.setImageUrl(branchDTO.getImageUrl());
        
        Branch updated = branchRepository.save(branch);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteBranch(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        branchRepository.delete(branch);
    }
    
    @Transactional
    public BranchDTO toggleBranchStatus(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Branch not found with id: " + id));
        branch.setIsActive(!branch.getIsActive());
        Branch updated = branchRepository.save(branch);
        return convertToDTO(updated);
    }
    
    private BranchDTO convertToDTO(Branch branch) {
        BranchDTO dto = new BranchDTO();
        dto.setId(branch.getId());
        dto.setCode(branch.getCode());
        dto.setName(branch.getName());
        dto.setAddress(branch.getAddress());
        dto.setPhone(branch.getPhone());
        dto.setEmail(branch.getEmail());
        dto.setManager(branch.getManager());
        dto.setOpeningHours(branch.getOpeningHours());
        dto.setLatitude(branch.getLatitude());
        dto.setLongitude(branch.getLongitude());
        dto.setIsActive(branch.getIsActive());
        dto.setDisplayOrder(branch.getDisplayOrder());
        dto.setDescription(branch.getDescription());
        dto.setImageUrl(branch.getImageUrl());
        dto.setCreatedAt(branch.getCreatedAt());
        dto.setUpdatedAt(branch.getUpdatedAt());
        return dto;
    }
}