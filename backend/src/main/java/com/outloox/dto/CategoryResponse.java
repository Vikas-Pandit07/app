package com.outloox.dto;

import java.time.LocalDateTime;

public class CategoryResponse {
	
	private int categoryId;
	private String categoryName;
	private String description;
	private LocalDateTime createdAt;
	private long productCount;
	
	public CategoryResponse() {
		
	}

	public CategoryResponse(int categoryId, String categoryName, String description, LocalDateTime createdAt,
			long productCount) {
		super();
		this.categoryId = categoryId;
		this.categoryName = categoryName;
		this.description = description;
		this.createdAt = createdAt;
		this.productCount = productCount;
	}

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public long getProductCount() {
		return productCount;
	}

	public void setProductCount(long productCount) {
		this.productCount = productCount;
	}
}
