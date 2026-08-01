package com.outloox.controller.admin;

import com.outloox.dto.UpdateUserStatusRequest;
import com.outloox.service.admin.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "users", adminUserService.getAllUsers()
        ));
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Integer userId, @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", adminUserService.updateUserStatus(userId, request.isActive())
        ));
    }
}
