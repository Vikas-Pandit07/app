package com.outloox.service.admin;

import com.outloox.dto.admin.AdminUserResponse;
import com.outloox.entity.User;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll(PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public AdminUserResponse updateUserStatus(Integer userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(active);
        return mapToResponse(userRepository.save(user));
    }

    private AdminUserResponse mapToResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
