package com.outloox.controller.admin;

import com.outloox.dto.admin.AdminStatsResponse;
import com.outloox.service.admin.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}", allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        AdminStatsResponse stats = adminService.getDashboardStats();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dashboard stats fetched successfully");
        response.put("stats", stats);
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }
    
    //  Recent orders for dashboard
    @GetMapping("/orders/recent")
    public ResponseEntity<?> getRecentOrders() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("orders", adminService.getRecentOrders());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/customers/recent")
    public ResponseEntity<?> getRecentCustomers() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("customers", adminService.getRecentCustomers());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/products/top")
    public ResponseEntity<?> getTopProducts() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("products", adminService.getTopProducts());
        return ResponseEntity.ok(response);
    }
}
