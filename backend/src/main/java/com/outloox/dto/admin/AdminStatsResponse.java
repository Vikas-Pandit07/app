package com.outloox.dto.admin;

import java.math.BigDecimal;
import java.util.List;

import com.outloox.dto.admin.AdminStatsResponse.MonthlyRevenue;
import com.outloox.dto.admin.AdminStatsResponse.RecentCustomer;
import com.outloox.dto.admin.AdminStatsResponse.RecentOrder;
import com.outloox.dto.admin.AdminStatsResponse.TopProduct;

public class AdminStatsResponse {

	private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalCustomers;
    private Long totalProducts;
	
    private Long pendingOrders;
    private Long processingOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
	
	private BigDecimal averageOrderValue;
	private Double conversionRate;
	
	private List<MonthlyRevenue> monthlyRevenue;
	
	private List<RecentOrder> recentOrders;
	
	private List<TopProduct> topProducts;
	
	private List<RecentCustomer> recentCustomers;

	public BigDecimal getTotalRevenue() {
		return totalRevenue;
	}

	public void setTotalRevenue(BigDecimal totalRevenue) {
		this.totalRevenue = totalRevenue;
	}

	public Long getTotalOrders() {
		return totalOrders;
	}

	public void setTotalOrders(Long totalOrders) {
		this.totalOrders = totalOrders;
	}

	public Long getTotalCustomers() {
		return totalCustomers;
	}

	public void setTotalCustomers(Long totalCustomers) {
		this.totalCustomers = totalCustomers;
	}

	public Long getTotalProducts() {
		return totalProducts;
	}

	public void setTotalProducts(Long totalProducts) {
		this.totalProducts = totalProducts;
	}

	public Long getPendingOrders() {
		return pendingOrders;
	}

	public void setPendingOrders(Long pendingOrders) {
		this.pendingOrders = pendingOrders;
	}

	public Long getProcessingOrders() {
		return processingOrders;
	}

	public void setProcessingOrders(Long processingOrders) {
		this.processingOrders = processingOrders;
	}

	public Long getDeliveredOrders() {
		return deliveredOrders;
	}

	public void setDeliveredOrders(Long deliveredOrders) {
		this.deliveredOrders = deliveredOrders;
	}

	public Long getCancelledOrders() {
		return cancelledOrders;
	}

	public void setCancelledOrders(Long cancelledOrders) {
		this.cancelledOrders = cancelledOrders;
	}

	public BigDecimal getAverageOrderValue() {
		return averageOrderValue;
	}

	public void setAverageOrderValue(BigDecimal averageOrderValue) {
		this.averageOrderValue = averageOrderValue;
	}

	public Double getConversionRate() {
		return conversionRate;
	}

	public void setConversionRate(Double conversionRate) {
		this.conversionRate = conversionRate;
	}

	public List<MonthlyRevenue> getMonthlyRevenue() {
		return monthlyRevenue;
	}

	public void setMonthlyRevenue(List<MonthlyRevenue> monthlyRevenue) {
		this.monthlyRevenue = monthlyRevenue;
	}

	public List<RecentOrder> getRecentOrders() {
		return recentOrders;
	}

	public void setRecentOrders(List<RecentOrder> recentOrders) {
		this.recentOrders = recentOrders;
	}

	public List<TopProduct> getTopProducts() {
		return topProducts;
	}

	public void setTopProducts(List<TopProduct> topProducts) {
		this.topProducts = topProducts;
	}

	public List<RecentCustomer> getRecentCustomers() {
		return recentCustomers;
	}

	public void setRecentCustomers(List<RecentCustomer> recentCustomers) {
		this.recentCustomers = recentCustomers;
	}
	
	 public static class MonthlyRevenue {
	        private String month;
	        private BigDecimal revenue;
	        
	        public String getMonth() { return month; }
	        public void setMonth(String month) { this.month = month; }
	        
	        public BigDecimal getRevenue() { return revenue; }
	        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
	    }
	 
	 public static class RecentOrder {
	        private Integer orderId;
	        private String customerName;
	        private BigDecimal amount;
	        private String status;
	        private String date;
	        
	        public Integer getOrderId() { return orderId; }
	        public void setOrderId(Integer orderId) { this.orderId = orderId; }
	        
	        public String getCustomerName() { return customerName; }
	        public void setCustomerName(String customerName) { this.customerName = customerName; 
	        }
	        public BigDecimal getAmount() { return amount; }
	        public void setAmount(BigDecimal amount) { this.amount = amount; }
	        
	        public String getStatus() { return status; }
	        public void setStatus(String status) { this.status = status; }
	        
	        public String getDate() { return date; }
	        public void setDate(String date) { this.date = date; }
	   	}
	 
	  public static class TopProduct {
	        private Integer productId;
	        private String productName;
	        private Integer soldCount;
	        private BigDecimal revenue;
	        
	        public Integer getProductId() { return productId; }
	        public void setProductId(Integer productId) { this.productId = productId; }
	        
	        public String getProductName() { return productName; }
	        public void setProductName(String productName) { this.productName = productName; }
	        
	        public Integer getSoldCount() { return soldCount; }
	        public void setSoldCount(Integer soldCount) { this.soldCount = soldCount; }
	        
	        public BigDecimal getRevenue() { return revenue; }
	        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
	    }
	  
	  public static class RecentCustomer {
	        private Integer customerId;
	        private String name;
	        private String email;
	        private String joinDate;
	        private Integer orderCount;
	        
	        public Integer getCustomerId() { return customerId; }
	        public void setCustomerId(Integer customerId) { this.customerId = customerId; }
	        
	        public String getName() { return name; }
	        public void setName(String name) { this.name = name; }
	        
	        public String getEmail() { return email; }
	        public void setEmail(String email) { this.email = email; }
	        
	        public String getJoinDate() { return joinDate; }
	        public void setJoinDate(String joinDate) { this.joinDate = joinDate; }
	        
	        public Integer getOrderCount() { return orderCount; }
	        public void setOrderCount(Integer orderCount) { this.orderCount = orderCount; }
	    }
}
