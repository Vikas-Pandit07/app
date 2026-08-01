package com.outloox.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.outloox.dto.AddToCartRequest;
import com.outloox.dto.CartSummaryResponse;
import com.outloox.dto.UpdateCartItemRequest;
import com.outloox.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}", allowCredentials = "true")
public class CartController {
    
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }
    
    // Add item to cart
    @PostMapping("/items")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request) {
    	   cartService.addToCart(request);
           return ResponseEntity.ok(Map.of("success", true));
    }
    
    // Get all cart items
    @GetMapping
    public ResponseEntity<?> getCart() {
         CartSummaryResponse summary = cartService.getCartSummary();
         return ResponseEntity.ok(Map.of(
                 "success", true,
                 "items", summary.getItems(),
                 "subtotal", summary.getSubtotal(),
                 "shipping", summary.getShipping(),
                 "total", summary.getTotal(),
                 "itemCount", summary.getItemCount()
         ));
    }
    
    // Update item quantity
    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Integer itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
    	cartService.updateQuantity(itemId, request.getQuantity());
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    // Remove item from cart
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItemFromCart(@PathVariable Integer itemId) {
    	 cartService.removeCartItem(itemId);
         return ResponseEntity.ok(Map.of("success", true));
    }
    
    // Get cart item count for badge
    @GetMapping("/count")
    public ResponseEntity<?> getCartItemCount() {
        
            int count = cartService.getCartItemCount();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", count
            ));
    }
    
    // Clear cart
    @DeleteMapping()
    public ResponseEntity<?> clearCart() {
    	 cartService.clearCart();
         return ResponseEntity.ok(Map.of("success", true));
    }
}
