package com.outloox.repository;

import com.outloox.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    
    // Find only active addresses for a user
    List<Address> findByUserUserIdAndIsActiveTrue(Integer userId);
    
    // Find all addresses (including inactive) - for admin
    List<Address> findByUserUserId(Integer userId);
    
    // Find default address for a user (only active)
    Optional<Address> findByUserUserIdAndIsDefaultTrueAndIsActiveTrue(Integer userId);
    
    // Find by ID and user (only active)
    Optional<Address> findByAddressIdAndUserUserIdAndIsActiveTrue(Integer addressId, Integer userId);
    
    // Soft delete - mark as inactive
    @Modifying
    @Transactional
    @Query("UPDATE Address a SET a.isActive = false, a.isDefault = false WHERE a.addressId = :addressId AND a.user.userId = :userId")
    int deactivateAddress(@Param("addressId") Integer addressId, @Param("userId") Integer userId);
    
    // Clear all default addresses for a user
    @Modifying
    @Transactional
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.userId = :userId AND a.isActive = true")
    void clearDefaultAddresses(@Param("userId") Integer userId);
}