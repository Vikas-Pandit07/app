package com.outloox.repository;

import com.outloox.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {

    List<ProductImage> findByProduct_ProductId(Integer productId);

    List<ProductImage> findByProduct_ProductIdOrderByPrimaryImageDescImageIdAsc(Integer productId);

    void deleteByProduct_ProductId(Integer productId);
}
