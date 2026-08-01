import type { CartSummaryResponse } from '../lib/types';
import { apiRequest } from './apiClient';

export function getCart() {
  return apiRequest<CartSummaryResponse>('/api/cart');
}

export function addToCart(payload: { productId: number; quantity: number; size: string; color: string }) {
  return apiRequest<{ success: boolean }>('/api/cart/items', {
    method: 'POST',
    body: payload,
  });
}

export function updateCartItemQuantity(payload: { itemId: number; quantity: number }) {
  return apiRequest<{ success: boolean }>(`/api/cart/items/${payload.itemId}`, {
    method: 'PUT',
    body: { quantity: payload.quantity },
  });
}

export function removeCartItem(itemId: number) {
  return apiRequest<{ success: boolean }>(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function clearRemoteCart() {
  return apiRequest<{ success: boolean }>('/api/cart', {
    method: 'DELETE',
  });
}
