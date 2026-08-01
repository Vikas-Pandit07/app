package com.outloox.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
	private Integer orderId;
	private BigDecimal totalAmount;
	private String orderStatus;
	private String paymentStatus;
	private LocalDateTime orderDate;
	private String paymentMethod;
	private AddressResponse shippingAddress;
	private List<OrderItemResponse> items;

	public Integer getOrderId() {
		return orderId;
	}
	public void setOrderId(Integer integer) {
		this.orderId = integer;
	}
	public BigDecimal getTotalAmount() {
		return totalAmount;
	}
	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}
	public String getOrderStatus() {
		return orderStatus;
	}
	public void setOrderStatus(String orderStatus) {
		this.orderStatus = orderStatus;
	}
	public String getPaymentStatus() {
		return paymentStatus;
	}
	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}
	public LocalDateTime getOrderDate() {
		return orderDate;
	}
	public void setOrderDate(LocalDateTime orderDate) {
		this.orderDate = orderDate;
	}
	public String getPaymentMethod() {
		return paymentMethod;
	}
	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}
	public AddressResponse getShippingAddress() {
		return shippingAddress;
	}
	public void setShippingAddress(AddressResponse addressResponse) {
		this.shippingAddress = addressResponse;
	}
	public List<OrderItemResponse> getItems() {
		return items;
	}
	public void setItems(List<OrderItemResponse> items) {
		this.items = items;
	}
}
