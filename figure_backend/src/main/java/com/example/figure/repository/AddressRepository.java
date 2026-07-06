package com.example.figure.repository;

import com.example.figure.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    
    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);
    
    Optional<Address> findByIdAndUserId(Long id, Long userId);
    
    @Modifying
    @Transactional
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId AND a.isDefault = true")
    void resetDefaultAddress(Long userId);
    
    boolean existsByUserIdAndIsDefaultTrue(Long userId);
}