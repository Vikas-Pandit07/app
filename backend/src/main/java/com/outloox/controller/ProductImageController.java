package com.outloox.controller;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.outloox.service.ProductImageService;



@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}", allowCredentials = "true")

public class ProductImageController {
	
	private final ProductImageService service;

	public ProductImageController(ProductImageService service) {
		super();
		this.service = service;
	}
	
	@PostMapping("/{productId}/images")
	public ResponseEntity<?> uploadImages(
			@PathVariable Integer productId,
			@RequestParam("images") List<MultipartFile> images) {
		
		service.uploadProductImages(productId, images);
		return ResponseEntity.ok(Map.of("message", "Image uploaded"));
	}

}
