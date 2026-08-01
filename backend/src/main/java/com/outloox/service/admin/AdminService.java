package com.outloox.service.admin;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.outloox.dto.admin.AdminStatsResponse;
import com.outloox.entity.Order;
import com.outloox.entity.enums.OrderStatus;
import com.outloox.entity.enums.Role;
import com.outloox.entity.User;
import com.outloox.repository.OrderItemRepository;
import com.outloox.repository.OrderRepository;
import com.outloox.repository.ProductRepository;
import com.outloox.repository.UserRepository;

@Service
public class AdminService {

    private static final int DASHBOARD_LIMIT = 10;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminService(OrderRepository orderRepository, UserRepository userRepository,
            ProductRepository productRepository, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public AdminStatsResponse getDashboardStats() {
        AdminStatsResponse response = new AdminStatsResponse();

        Long customerCount = userRepository.countByRoleAndDeletedAtIsNull(Role.CUSTOMER);
        response.setTotalCustomers(customerCount != null ? customerCount : 0L);

        Long productCount = productRepository.count();
        response.setTotalProducts(productCount != null ? productCount : 0L);

        List<Object[]> orderStats = orderRepository.getOrderStatistics();
        response.setPendingOrders(0L);
        response.setProcessingOrders(0L);
        response.setDeliveredOrders(0L);
        response.setCancelledOrders(0L);

        for (Object[] stat : orderStats) {
            OrderStatus status = (OrderStatus) stat[0];
            Long count = (Long) stat[1];

            switch (status) {
                case PENDING -> response.setPendingOrders(count);
                case PROCESSING, CONFIRMED, PACKED, SHIPPED, OUT_FOR_DELIVERY -> response.setProcessingOrders(response.getProcessingOrders() + count);
                case DELIVERED -> response.setDeliveredOrders(count);
                case CANCELLED, REFUNDED, RETURN_REQUESTED, RETURN_APPROVED, RETURN_RECEIVED -> response.setCancelledOrders(response.getCancelledOrders() + count);
                default -> {
                }
            }
        }

        response.setTotalOrders(
                response.getPendingOrders()
                        + response.getProcessingOrders()
                        + response.getDeliveredOrders()
                        + response.getCancelledOrders());

        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        response.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        if (response.getTotalOrders() > 0) {
            response.setAverageOrderValue(
                    response.getTotalRevenue().divide(
                            BigDecimal.valueOf(response.getTotalOrders()),
                            2,
                            RoundingMode.HALF_UP));
        } else {
            response.setAverageOrderValue(BigDecimal.ZERO);
        }

        if (response.getTotalCustomers() > 0) {
            double conversion = (response.getTotalOrders() * 100.0) / response.getTotalCustomers();
            response.setConversionRate(Math.min(conversion, 100.0));
        } else {
            response.setConversionRate(0.0);
        }

        response.setMonthlyRevenue(getMonthlyRevenueData());
        response.setRecentOrders(getRecentOrders());
        response.setTopProducts(getTopProducts());
        response.setRecentCustomers(getRecentCustomers());

        return response;
    }

    public List<AdminStatsResponse.MonthlyRevenue> getMonthlyRevenueData() {
        return orderRepository.getMonthlyRevenueLastSixMonths().stream()
                .map(row -> {
                    String month = String.valueOf(row[0]);
                    BigDecimal revenue = toBigDecimal(row[1]);
                    return createMonthlyRevenue(month, revenue);
                })
                .toList();
    }

    public List<AdminStatsResponse.RecentOrder> getRecentOrders() {
        List<Order> recentOrders = orderRepository.findAll(
                PageRequest.of(0, DASHBOARD_LIMIT, Sort.by(Sort.Direction.DESC, "orderDate")))
                .getContent();

        return recentOrders.stream()
                .map(order -> createRecentOrder(
                        order.getOrderId(),
                        order.getUser() != null ? order.getUser().getUsername() : "Unknown",
                        order.getTotalAmount(),
                        order.getOrderStatus().name(),
                        order.getOrderDate() != null ? order.getOrderDate().toLocalDate().format(DATE_FORMATTER) : ""))
                .toList();
    }

    public List<AdminStatsResponse.TopProduct> getTopProducts() {
        return orderItemRepository.findTopSellingProductsWithRevenue().stream()
                .limit(DASHBOARD_LIMIT)
                .map(row -> {
                    Integer productId = ((Number) row[0]).intValue();
                    String productName = String.valueOf(row[1]);
                    Integer soldCount = ((Number) row[2]).intValue();
                    BigDecimal revenue = toBigDecimal(row[3]);
                    return createTopProduct(productId, productName, soldCount, revenue);
                })
                .toList();
    }

    public List<AdminStatsResponse.RecentCustomer> getRecentCustomers() {
        List<User> customers = userRepository.findByRoleAndDeletedAtIsNull(
            Role.CUSTOMER,
            PageRequest.of(0, DASHBOARD_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();

        return customers.stream()
                .map(customer -> {
                    int orderCount = Math.toIntExact(orderRepository.countByUserUserId(customer.getUserId()));
                    String joinDate = customer.getCreatedAt() != null
                            ? customer.getCreatedAt().toLocalDate().format(DATE_FORMATTER)
                            : "";

                    return createRecentCustomer(
                            customer.getUserId(),
                            customer.getUsername(),
                            customer.getEmail(),
                            joinDate,
                            orderCount);
                })
                .toList();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return new BigDecimal(value.toString());
    }

    private AdminStatsResponse.MonthlyRevenue createMonthlyRevenue(String month, BigDecimal revenue) {
        AdminStatsResponse.MonthlyRevenue monthlyRevenue = new AdminStatsResponse.MonthlyRevenue();
        monthlyRevenue.setMonth(month);
        monthlyRevenue.setRevenue(revenue);
        return monthlyRevenue;
    }

    private AdminStatsResponse.RecentOrder createRecentOrder(
            Integer id,
            String customerName,
            BigDecimal amount,
            String status,
            String date) {
        AdminStatsResponse.RecentOrder recentOrder = new AdminStatsResponse.RecentOrder();
        recentOrder.setOrderId(id);
        recentOrder.setCustomerName(customerName);
        recentOrder.setAmount(amount);
        recentOrder.setStatus(status);
        recentOrder.setDate(date);
        return recentOrder;
    }

    private AdminStatsResponse.TopProduct createTopProduct(
            Integer id,
            String name,
            Integer soldCount,
            BigDecimal revenue) {
        AdminStatsResponse.TopProduct topProduct = new AdminStatsResponse.TopProduct();
        topProduct.setProductId(id);
        topProduct.setProductName(name);
        topProduct.setSoldCount(soldCount);
        topProduct.setRevenue(revenue);
        return topProduct;
    }

    private AdminStatsResponse.RecentCustomer createRecentCustomer(
            Integer id,
            String name,
            String email,
            String joinDate,
            Integer orders) {
        AdminStatsResponse.RecentCustomer recentCustomer = new AdminStatsResponse.RecentCustomer();
        recentCustomer.setCustomerId(id);
        recentCustomer.setName(name);
        recentCustomer.setEmail(email);
        recentCustomer.setJoinDate(joinDate);
        recentCustomer.setOrderCount(orders);
        return recentCustomer;
    }
}
