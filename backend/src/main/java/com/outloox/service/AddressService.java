package com.outloox.service;

import com.outloox.dto.AddAddressRequest;
import com.outloox.dto.AddressResponse;
import com.outloox.dto.UpdateAddressRequest;
import com.outloox.entity.Address;
import com.outloox.entity.User;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.AddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserService userService;

    public AddressService(AddressRepository addressRepository, UserService userService) {
        this.addressRepository = addressRepository;
        this.userService = userService;
    }

    public List<AddressResponse> getUserAddresses() {
        User user = userService.getCurrentUser();
        return addressRepository.findByUserUserIdAndIsActiveTrue(user.getUserId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public AddressResponse addAddress(AddAddressRequest request) {
        User user = userService.getCurrentUser();

        Address address = new Address();
        address.setUser(user);
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPinCode(request.getPinCode());
        address.setCountry(request.getCountry());
        address.setDefault(request.isDefault());

        if (address.isDefault()) {
            addressRepository.clearDefaultAddresses(user.getUserId());
        }

        return mapToResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Integer addressId, UpdateAddressRequest request) {
        User user = userService.getCurrentUser();

        Address address = addressRepository.findByAddressIdAndUserUserIdAndIsActiveTrue(addressId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (request.getFullName() != null) address.setFullName(request.getFullName());
        if (request.getPhone() != null) address.setPhone(request.getPhone());
        if (request.getAddressLine() != null) address.setAddressLine(request.getAddressLine());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPinCode() != null) address.setPinCode(request.getPinCode());

        if (request.isDefault() && !address.isDefault()) {
            addressRepository.clearDefaultAddresses(user.getUserId());
            address.setDefault(true);
        }

        return mapToResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Integer addressId) {
        User user = userService.getCurrentUser();
        int updated = addressRepository.deactivateAddress(addressId, user.getUserId());

        if (updated == 0) {
            throw new ResourceNotFoundException("Address not found or not authorized");
        }
    }

    @Transactional
    public void setDefaultAddress(Integer addressId) {
        User user = userService.getCurrentUser();

        Address address = addressRepository.findByAddressIdAndUserUserIdAndIsActiveTrue(addressId, user.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        addressRepository.clearDefaultAddresses(user.getUserId());
        address.setDefault(true);
        addressRepository.save(address);
    }

    private AddressResponse mapToResponse(Address address) {
        AddressResponse response = new AddressResponse();
        response.setAddressId(address.getAddressId());
        response.setFullName(address.getFullName());
        response.setPhone(address.getPhone());
        response.setAddressLine(address.getAddressLine());
        response.setCity(address.getCity());
        response.setState(address.getState());
        response.setPinCode(address.getPinCode());
        response.setCountry(address.getCountry());
        response.setDefault(address.isDefault());
        return response;
    }
}
