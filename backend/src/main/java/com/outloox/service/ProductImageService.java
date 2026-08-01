package com.outloox.service;

import java.util.Iterator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.outloox.entity.Product;
import com.outloox.entity.ProductImage;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.ProductImageRepository;
import com.outloox.repository.ProductRepository;


@Service
public class ProductImageService {
	
	private final ImageUploadService uploadService;
	private final ProductImageRepository imageRepository;
	private final ProductRepository productRepository;
	
	public ProductImageService(
			ImageUploadService uploadService, 
			ProductImageRepository imageRepository,
			ProductRepository productRepository) {
		super();
		this.uploadService = uploadService;
		this.imageRepository = imageRepository;
		this.productRepository = productRepository;
	}
	
	public void uploadProductImages(
			Integer productId,
			List<MultipartFile> files) {
		
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product not found"));
				
		for (int i = 0; i < files.size(); i++) {
			String url = uploadService.uploadProductImage(files.get(i));
			
			ProductImage image = new ProductImage();
			image.setProduct(product);
			image.setImageUrl(url);
			image.setPrimaryImage(i == 0); // first img = primary
			
			imageRepository.save(image);
		}
	}

}
