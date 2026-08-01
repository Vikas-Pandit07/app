package com.outloox.repository;

import com.outloox.entity.Product;
import com.outloox.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @EntityGraph(attributePaths = {"category", "images"})
    Page<Product> findByStatusNot(ProductStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images"})
    Page<Product> findByCategory_CategoryNameIgnoreCaseAndStatusNot(String categoryName, ProductStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "images"})
    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);

    @EntityGraph(attributePaths = {"category", "images"})
    Optional<Product> findByProductIdAndDeletedAtIsNull(Integer productId);

    boolean existsBySlugAndDeletedAtIsNull(String slug);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.productId = :productId AND p.deletedAt IS NULL")
    Optional<Product> findByIdForUpdate(@Param("productId") Integer productId);

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND p.status = 'ACTIVE' AND p.badge = 'featured'")
    List<Product> findFeaturedProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND p.status = 'ACTIVE' AND p.badge = 'new'")
    List<Product> findNewArrivals(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND p.status = 'ACTIVE' AND p.badge = 'bestseller'")
    List<Product> findBestSellers(Pageable pageable);
}
