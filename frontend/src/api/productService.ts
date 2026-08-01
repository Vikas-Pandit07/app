import type { BackendProductResponse } from '../lib/types';
import { apiRequest } from './apiClient';

export function getProducts(category?: string) {
  const url = category && category !== 'all' ? `/api/products?category=${encodeURIComponent(category)}` : '/api/products';
  return apiRequest<BackendProductResponse[]>(url);
}

export function getProductById(productId: string | number) {
  return apiRequest<BackendProductResponse>(`/api/products/${productId}`);
}
