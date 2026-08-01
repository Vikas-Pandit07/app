package com.outloox.controller;

import com.outloox.dto.CategoryRequest;
import com.outloox.dto.CategoryResponse;
import com.outloox.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}", allowCredentials = "true")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Category created successfully");
        result.put("data", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", categories);
        result.put("count", categories.size());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable int id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", category);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable int id, @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Category updated successfully");
        result.put("data", response);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable int id) {
        categoryService.deleteCategory(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Category deleted successfully");
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchCategories(@RequestParam String keyword) {
        List<CategoryResponse> categories = categoryService.searchCategories(keyword);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", categories);
        result.put("count", categories.size());
        return ResponseEntity.ok(result);
    }
}
