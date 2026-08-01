package com.outloox.service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.outloox.exception.FileUploadException;
import com.outloox.exception.InvalidFileException;
import com.cloudinary.Cloudinary;

@Service
public class ImageUploadService {
	
	private final Cloudinary cloudinary;
	
	public ImageUploadService(Cloudinary cloudinary) {
		super();
		this.cloudinary = cloudinary;
	}

	
	public String uploadProductImage(MultipartFile file) {
		try {
//			// validation
//			if (file.isEmpty()) {
//				throw new RuntimeException("File is empty");
//			}
//			
//			if (!file.getContentType().startsWith("image/")) {
//				throw new RuntimeException()
//			}
//			
//			// size
//			if (file.getSize() > 5 * 1024 * 1024) {
//				throw new RuntimeException("File size exceeds 5MB limit");
//			}
//			
			
			
			Map<?, ?> result = cloudinary.uploader().upload(
					file.getBytes(),
					Map.of(
						"folder", "aythrex/products",
						"resource_type", "image"
						)
			);
			return result.get("secure_url").toString();
			
		} catch (Exception e) {
			throw new FileUploadException("Image upload failed");
		}
	}
}
