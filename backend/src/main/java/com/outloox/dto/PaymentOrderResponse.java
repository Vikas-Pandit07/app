package com.outloox.dto;

import java.math.BigDecimal;

public class PaymentOrderResponse {
	private String keyId;
	private Integer internalOrderId;
	private String razorpayOrderId;
	private Long amount;
	private String currency;
	
	public String getKeyId() {
		return keyId;
	}
	public void setKeyId(String keyId) {
		this.keyId = keyId;
	}
	public Integer getInternalOrderId() {
		return internalOrderId;
	}
	public void setInternalOrderId(Integer internalOrderId) {
		this.internalOrderId = internalOrderId;
	}
	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}
	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}
	public Long getAmount() {
		return amount;
	}
	public void setAmount(Long amount) {
		this.amount = amount;
	}
	public String getCurrency() {
		return currency;
	}
	public void setCurrency(String currency) {
		this.currency = currency;
	}
}
