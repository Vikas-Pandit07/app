import type { OrderResponse } from '../lib/types';
import { apiRequest } from './apiClient';

export function checkoutOrder(payload: { addressId: number; paymentMethod: string }) {
  return apiRequest<{
    orderId: number;
    orderStatus: string;
    totalAmount: number;
    paymentStatus: string;
    message?: string;
  }>('/api/orders/checkout', {
    method: 'POST',
    body: payload,
  });
}

export function getOrders() {
  return apiRequest<{ success: boolean; orders: OrderResponse[] }>('/api/orders');
}

export function getOrderById(orderId: number | string) {
  return apiRequest<{ success: boolean; order: OrderResponse }>(`/api/orders/${orderId}`);
}
