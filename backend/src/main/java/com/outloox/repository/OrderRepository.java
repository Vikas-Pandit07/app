package com.outloox.repository;

import com.outloox.entity.Order;
import com.outloox.entity.enums.OrderStatus;
import com.outloox.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    
    // Find all orders for a user
    List<Order> findByUserUserId(Integer userId);
    
 // Find order by ID and user ID (for security)
    Optional<Order> findByOrderIdAndUserUserId(Integer orderId, Integer userId);

    // Find orders within date range
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
 // Find orders with specific product
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi WHERE oi.product.productId = :productId")
    List<Order> findOrdersByProductId(@Param("productId") Integer productId);
    
    // Find recent orders 
    @Query("SELECT o FROM Order o WHERE o.orderDate >= :date")
    List<Order> findRecentOrders(@Param("date") LocalDateTime date);
    
    // Count orders by user
    long countByUserUserId(Integer userId);
    
//    count of orders by status
    @Query("SELECT o.orderStatus, COUNT(o) FROM Order o GROUP BY o.orderStatus")
    List<Object[]> getOrderStatistics();
    
    // Calculate total revenue
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID'")
    BigDecimal getTotalRevenue();

    @Query(value = "SELECT DATE_FORMAT(o.order_date, '%b') AS month_label, " +
            "COALESCE(SUM(o.total_amount), 0) AS revenue " +
            "FROM orders o " +
            "WHERE o.payment_status = 'PAID' " +
            "AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) " +
            "GROUP BY YEAR(o.order_date), MONTH(o.order_date), DATE_FORMAT(o.order_date, '%b') " +
            "ORDER BY YEAR(o.order_date), MONTH(o.order_date)",
            nativeQuery = true)
    List<Object[]> getMonthlyRevenueLastSixMonths();
    
    // Find order by Razorpay order ID
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Order> findByRazorpayPaymentId(String razorpayPaymentId);
    
    // Find orders by status
    List<Order> findByOrderStatus(OrderStatus status);
    
    // Find orders by payment status
    List<Order> findByPaymentStatus(PaymentStatus status);
}
