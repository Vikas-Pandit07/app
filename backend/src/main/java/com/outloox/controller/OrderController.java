package com.outloox.controller;

import com.outloox.dto.CheckoutRequest;
import com.outloox.dto.CheckoutResponse;
import com.outloox.dto.OrderResponse;
import com.outloox.service.OrderService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}", allowCredentials = "true")
public class OrderController {
    
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request) {
    	
    	CheckoutResponse response = orderService.createOrder(request);
    	
    	return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<?> getUserOrders() {
        
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "orders", orderService.getUserOrders()
            ));
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Integer orderId) {
            OrderResponse order = orderService.getOrderById(orderId);
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "order", order
            ));
    }
}