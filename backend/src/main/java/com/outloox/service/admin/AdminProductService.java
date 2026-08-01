package com.outloox.service.admin;

import com.outloox.dto.CreateProductRequest;
import com.outloox.dto.ProductResponse;
import com.outloox.dto.UpdateProductRequest;
import com.outloox.entity.Category;
import com.outloox.entity.Product;
import com.outloox.entity.ProductImage;
import com.outloox.entity.enums.ProductStatus;
import com.outloox.exception.BadRequestException;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.CategoryRepository;
import com.outloox.repository.ProductImageRepository;
import com.outloox.repository.ProductRepository;
import com.outloox.util.ProductCatalogMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AdminProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;

    public AdminProductService(
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = new Product();
        applyRequest(product, request, category);
        Product saved = productRepository.save(product);
        syncImages(saved, request.getImageUrls());
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Integer productId, UpdateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getSlug() != null) product.setSlug(ensureUniqueSlug(request.getSlug(), product.getProductId()));
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) product.setOriginalPrice(request.getOriginalPrice());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getBadge() != null) product.setBadge(request.getBadge());
        if (request.getRating() != null) product.setRating(request.getRating());
        if (request.getReviews() != null) product.setReviewCount(request.getReviews());
        if (request.getColors() != null) product.setColorsData(ProductCatalogMapper.joinList(request.getColors()));
        if (request.getSizes() != null) product.setSizesData(ProductCatalogMapper.joinList(request.getSizes()));
        if (request.getFeatures() != null) product.setFeaturesData(ProductCatalogMapper.joinList(request.getFeatures()));
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                product.setStatus(ProductStatus.valueOf(request.getStatus().trim().toUpperCase(Locale.ROOT)));
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Invalid product status: " + request.getStatus());
            }
        }

        Product saved = productRepository.save(product);
        if (request.getImageUrls() != null) {
            syncImages(saved, request.getImageUrls());
        }
        return mapToResponse(saved);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public ProductResponse getProductById(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setStatus(ProductStatus.DISABLED);
        productRepository.save(product);
    }

    private void applyRequest(Product product, CreateProductRequest request, Category category) {
        product.setName(request.getName());
        product.setSlug(ensureUniqueSlug(request.getSlug() != null && !request.getSlug().isBlank() ? request.getSlug() : request.getName(), null));
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setStock(request.getStock());
        product.setCategory(category);
        product.setBadge(request.getBadge());
        product.setRating(request.getRating() != null ? request.getRating() : 4.5);
        product.setReviewCount(request.getReviews() != null ? request.getReviews() : 0);
        product.setColorsData(ProductCatalogMapper.joinList(request.getColors()));
        product.setSizesData(ProductCatalogMapper.joinList(request.getSizes()));
        product.setFeaturesData(ProductCatalogMapper.joinList(request.getFeatures()));
        product.setStatus(request.getStock() != null && request.getStock() > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK);
    }

    private void syncImages(Product product, List<String> imageUrls) {
        productImageRepository.deleteByProduct_ProductId(product.getProductId());
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        for (int index = 0; index < imageUrls.size(); index++) {
            String imageUrl = imageUrls.get(index);
            if (imageUrl == null || imageUrl.isBlank()) {
                continue;
            }
            ProductImage image = new ProductImage();
            image.setProduct(product);
            image.setImageUrl(imageUrl.trim());
            image.setPrimaryImage(index == 0);
            productImageRepository.save(image);
        }
    }

    private String ensureUniqueSlug(String candidate, Integer currentProductId) {
        String base = ProductCatalogMapper.slugify(candidate);
        String slug = base;
        int suffix = 2;
        while (productRepository.findBySlugAndDeletedAtIsNull(slug)
                .filter(existing -> currentProductId == null || existing.getProductId() != currentProductId)
                .isPresent()) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }

    private ProductResponse mapToResponse(Product product) {
        List<String> images = productImageRepository.findByProduct_ProductIdOrderByPrimaryImageDescImageIdAsc(product.getProductId())
                .stream()
                .map(ProductImage::getImageUrl)
                .toList();

        ProductResponse response = new ProductResponse();
        response.setProductId(product.getProductId());
        response.setSlug(product.getSlug());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setOriginalPrice(product.getOriginalPrice());
        String resolvedStatus = product.getStatus() != null ? product.getStatus().name() : (product.getStock() > 0 ? ProductStatus.ACTIVE.name() : ProductStatus.OUT_OF_STOCK.name());
        response.setStock(product.getStock());
        response.setInStock(product.getStock() > 0 && !ProductStatus.DISABLED.name().equals(resolvedStatus));
        response.setCategory(product.getCategory().getCategoryName());
        response.setImages(images);
        response.setColors(ProductCatalogMapper.splitList(product.getColorsData()));
        response.setSizes(ProductCatalogMapper.splitList(product.getSizesData()));
        response.setFeatures(ProductCatalogMapper.splitList(product.getFeaturesData()));
        response.setRating(product.getRating());
        response.setReviews(product.getReviewCount());
        response.setBadge(product.getBadge());
        response.setStatus(product.getStatus().name());
        return response;
    }
}
