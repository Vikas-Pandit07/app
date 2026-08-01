package com.outloox.dto;

import jakarta.validation.constraints.NotNull;

public class PaymentOrderRequest {
	@NotNull(message = "orderId is required")
	private Integer orderId;

	public Integer getOrderId() {
		return orderId;
	}

	public void setOrderId(Integer orderId) {
		this.orderId = orderId;
	}
}

