package com.outloox.repository;

import com.outloox.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    
    // Find all order items for an order
    List<OrderItem> findByOrderOrderId(Integer orderId);
    
    // Find order items by product
    List<OrderItem> findByProductProductId(Integer productId);
    
    // Find top selling products
    @Query("SELECT oi.product.productId, SUM(oi.quantity) as totalSold " +
           "FROM OrderItem oi " +
           "GROUP BY oi.product.productId " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts();

    @Query("SELECT oi.product.productId, oi.product.name, SUM(oi.quantity), COALESCE(SUM(oi.totalPrice), 0) " +
            "FROM OrderItem oi " +
            "GROUP BY oi.product.productId, oi.product.name " +
            "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProductsWithRevenue();
    
    // Calculate total quantity sold for a product
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.product.productId = :productId")
    Integer getTotalSoldQuantity(@Param("productId") Integer productId);
    
    // Find order items by multiple order IDs
    List<OrderItem> findByOrderOrderIdIn(List<Integer> orderIds);
}
