package com.outloox.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartSummaryResponse {
	
	 private List<CartItemResponse> items;
	 private BigDecimal subtotal;
	 private BigDecimal shipping;
	 private BigDecimal total;
	 private int itemCount;
	 
	 public List<CartItemResponse> getItems() {
		 return items;
	 }
	 public void setItems(List<CartItemResponse> items) {
		 this.items = items;
	 }
	 public BigDecimal getSubtotal() {
		 return subtotal;
	 }
	 public void setSubtotal(BigDecimal subtotal) {
		 this.subtotal = subtotal;
	 }
	 public BigDecimal getShipping() {
		 return shipping;
	 }
	 public void setShipping(BigDecimal shipping) {
		 this.shipping = shipping;
	 }
	 public BigDecimal getTotal() {
		 return total;
	 }
	 public void setTotal(BigDecimal total) {
		 this.total = total;
	 }
	 public int getItemCount() {
		 return itemCount;
	 }
	 public void setItemCount(int itemCount) {
		 this.itemCount = itemCount;
	 }
}
