package com.example.figure.service;

import com.example.figure.dto.AddressDTO;
import com.example.figure.entity.Address;
import com.example.figure.entity.User;
import com.example.figure.repository.AddressRepository;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {
    
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    
    // SỬA: Nhận username thay vì userId
    public List<AddressDTO> getUserAddresses(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public AddressDTO getAddressById(Long id, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new RuntimeException("Address not found"));
        return convertToDTO(address);
    }
    
    @Transactional
    public AddressDTO createAddress(String username, AddressDTO addressDTO) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Nếu địa chỉ được đặt làm mặc định, reset các địa chỉ khác
        if (addressDTO.getIsDefault()) {
            addressRepository.resetDefaultAddress(user.getId());
        }
        
        // Nếu là địa chỉ đầu tiên, tự động đặt làm mặc định
        boolean hasAddresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId()).size() > 0;
        if (!hasAddresses) {
            addressDTO.setIsDefault(true);
        }
        
        Address address = new Address();
        address.setUser(user);
        address.setFullName(addressDTO.getFullName());
        address.setPhone(addressDTO.getPhone());
        address.setAddress(addressDTO.getAddress());
        address.setWard(addressDTO.getWard());
        address.setDistrict(addressDTO.getDistrict());
        address.setCity(addressDTO.getCity());
        address.setIsDefault(addressDTO.getIsDefault() != null ? addressDTO.getIsDefault() : false);
        address.setAddressType(addressDTO.getAddressType() != null ? addressDTO.getAddressType() : "home");
        
        Address saved = addressRepository.save(address);
        return convertToDTO(saved);
    }
    
    @Transactional
    public AddressDTO updateAddress(Long id, String username, AddressDTO addressDTO) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new RuntimeException("Address not found"));
        
        // Nếu cập nhật thành địa chỉ mặc định, reset các địa chỉ khác
        if (addressDTO.getIsDefault() && !address.getIsDefault()) {
            addressRepository.resetDefaultAddress(user.getId());
        }
        
        address.setFullName(addressDTO.getFullName());
        address.setPhone(addressDTO.getPhone());
        address.setAddress(addressDTO.getAddress());
        address.setWard(addressDTO.getWard());
        address.setDistrict(addressDTO.getDistrict());
        address.setCity(addressDTO.getCity());
        address.setIsDefault(addressDTO.getIsDefault());
        address.setAddressType(addressDTO.getAddressType());
        
        Address updated = addressRepository.save(address);
        return convertToDTO(updated);
    }
    
    @Transactional
    public void deleteAddress(Long id, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (address.getIsDefault()) {
            throw new RuntimeException("Cannot delete default address");
        }
        
        addressRepository.delete(address);
    }
    
    @Transactional
    public AddressDTO setDefaultAddress(Long id, String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        addressRepository.resetDefaultAddress(user.getId());
        
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new RuntimeException("Address not found"));
        address.setIsDefault(true);
        
        Address updated = addressRepository.save(address);
        return convertToDTO(updated);
    }
    
    private AddressDTO convertToDTO(Address address) {
        return AddressDTO.builder()
            .id(address.getId())
            .userId(address.getUser().getId())
            .fullName(address.getFullName())
            .phone(address.getPhone())
            .address(address.getAddress())
            .ward(address.getWard())
            .district(address.getDistrict())
            .city(address.getCity())
            .isDefault(address.getIsDefault())
            .addressType(address.getAddressType())
            .createdAt(address.getCreatedAt())
            .updatedAt(address.getUpdatedAt())
            .build();
    }
}