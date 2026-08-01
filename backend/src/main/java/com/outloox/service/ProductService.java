package com.outloox.service;

import com.outloox.dto.ProductResponse;
import com.outloox.entity.Product;
import com.outloox.entity.ProductImage;
import com.outloox.entity.enums.ProductStatus;
import org.springframework.data.domain.Pageable;
import com.outloox.exception.ResourceNotFoundException;
import com.outloox.repository.ProductImageRepository;
import com.outloox.repository.ProductRepository;
import com.outloox.util.ProductCatalogMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public ProductService(ProductRepository productRepository, ProductImageRepository productImageRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }

    public ProductResponse getProductByIdentifier(String identifier) {
        Product product = resolveProduct(identifier);
        return mapToResponse(product);
    }

    public List<ProductResponse> getProducts(String categoryName) {
        List<Product> products;
        if (categoryName != null && !categoryName.isBlank()) {
            products = productRepository
                    .findByCategory_CategoryNameIgnoreCaseAndStatusNot(categoryName.trim(), ProductStatus.DISABLED, Pageable.unpaged())
                    .getContent();
        } else {
            products = productRepository.findByStatusNot(ProductStatus.DISABLED, Pageable.unpaged()).getContent();
        }

        return products.stream().map(this::mapToResponse).toList();
    }

        private Product resolveProduct(String identifier) {
        if (identifier != null && identifier.matches("\\d+")) {
            return productRepository.findById(Integer.parseInt(identifier))
                .orElseGet(() -> productRepository.findBySlugAndDeletedAtIsNull(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found")));
        }

        return productRepository.findBySlugAndDeletedAtIsNull(identifier)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        }

    private ProductResponse mapToResponse(Product product) {
        List<String> images = productImageRepository.findByProduct_ProductIdOrderByPrimaryImageDescImageIdAsc(product.getProductId())
                .stream()
                .map(ProductImage::getImageUrl)
                .toList();

        ProductResponse response = new ProductResponse();
        response.setProductId(product.getProductId());
        response.setSlug(product.getSlug() != null && !product.getSlug().isBlank() ? product.getSlug() : ProductCatalogMapper.slugify(product.getName()));
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
