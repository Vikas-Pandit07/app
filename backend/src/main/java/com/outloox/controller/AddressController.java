package com.outloox.controller;

import com.outloox.dto.AddAddressRequest;
import com.outloox.dto.UpdateAddressRequest;
import com.outloox.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<?> getUserAddresses() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "addresses", addressService.getUserAddresses()
        ));
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@Valid @RequestBody AddAddressRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Address added successfully",
                "address", addressService.addAddress(request)
        ));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<?> updateAddress(
            @PathVariable Integer addressId,
            @Valid @RequestBody UpdateAddressRequest request
    ) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Address updated successfully",
                "address", addressService.updateAddress(addressId, request)
        ));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Integer addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Address removed successfully"
        ));
    }

    @PutMapping("/{addressId}/default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable Integer addressId) {
        addressService.setDefaultAddress(addressId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Default address set successfully"
        ));
    }
}
