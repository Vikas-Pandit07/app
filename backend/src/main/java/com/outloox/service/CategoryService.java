package com.outloox.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.outloox.dto.CategoryRequest;
import com.outloox.dto.CategoryResponse;
import com.outloox.entity.Category;
import com.outloox.exception.DuplicateResourceException;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.CategoryRepository;

@Service
public class CategoryService {
	
	private final CategoryRepository categoryRepository;

	public CategoryService(CategoryRepository categoryRepository) {
		super();
		this.categoryRepository = categoryRepository;
	}
	
	private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());
        response.setDescription(category.getDescription());
        return response;
    }
	
	public CategoryResponse createCategory(CategoryRequest request) {
		Optional<Category> existingCategory = categoryRepository.findByCategoryName(request.getCategoryName());
		
		if(existingCategory.isPresent()) {
			throw new DuplicateResourceException("Category with name '" + request.getCategoryName() + "' already exists");
			}
		
		Category category = new Category();
		category.setCategoryName(request.getCategoryName());
		category.setDescription(request.getDescription());
		
		Category savedCategory = categoryRepository.save(category);
        return mapToResponse(savedCategory);
	}
	
	// Get All Categories
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get Category by ID
    public CategoryResponse getCategoryById(int id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return mapToResponse(category);
    }

    // Get Category by Name
    public Optional<CategoryResponse> getCategoryByName(String name) {
        return categoryRepository.findByCategoryName(name)
                .map(this::mapToResponse);
    }
    
    // update category
    public CategoryResponse updateCategory(int id, CategoryRequest request) {
    	Category category = categoryRepository.findById(id)
    			.orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    	
    	// check if category name is being changed and if new name already exists
    	if (!category.getCategoryName().equals(request.getCategoryName())) {
    		Optional<Category> existingCategory = categoryRepository.findByCategoryName(request.getCategoryName());
    		
    		if (existingCategory.isPresent() && existingCategory.get().getCategoryId() != id) {
    			throw new DuplicateResourceException("Category with name '" + request.getCategoryName() + "' already exists");
    		}
    	}
    	
    	category.setCategoryName(request.getCategoryName());
    	category.setDescription(request.getDescription());
    	
    	Category updateCategory = categoryRepository.save(category);
    	return mapToResponse(updateCategory);
    }
    
//    delete category
    public void deleteCategory(int id) {
    	Category category = categoryRepository.findById(id)
    			.orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    	
    	categoryRepository.delete(category);
    }
    
    // Search Categories by keyword
    public List<CategoryResponse> searchCategories(String keyword) {
        return categoryRepository.findAll()
                .stream()
                .filter(category -> 
                    category.getCategoryName().toLowerCase().contains(keyword.toLowerCase()) ||
                    (category.getDescription() != null && 
                     category.getDescription().toLowerCase().contains(keyword.toLowerCase()))
                )
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get categories count
    public long getCategoriesCount() {
        return categoryRepository.count();
    }
    
    
	
}
