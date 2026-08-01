import type { BackendProductResponse } from '../lib/types';
import { apiRequest } from './apiClient';
import { getAdminSettings, updateAdminSettings } from './settingsService';

export interface AdminStatsResponse {
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  recentOrders: Array<{ orderId: number; customerName: string; amount: number; status: string; date: string }>;
  topProducts: Array<{ productId: number; productName: string; soldCount: number; revenue: number }>;
  recentCustomers: Array<{ customerId: number; name: string; email: string; joinDate: string; orderCount: number }>;
}

export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

export interface CategoryOption {
  categoryId: number;
  categoryName: string;
  description?: string;
}

export interface SiteSettingPair {
  key: string;
  value: string;
}

export function getAdminStats() {
  return apiRequest<{ success: boolean; stats: AdminStatsResponse }>('/api/admin/stats');
}

export function getAdminProducts() {
  return apiRequest<{ success: boolean; products: BackendProductResponse[] }>('/api/admin/products');
}

export function createAdminProduct(payload: Record<string, unknown>) {
  return apiRequest<{ success: boolean; product: BackendProductResponse }>('/api/admin/products', {
    method: 'POST',
    body: payload,
  });
}

export function updateAdminProduct(productId: number, payload: Record<string, unknown>) {
  return apiRequest<{ success: boolean; product: BackendProductResponse }>(`/api/admin/products/${productId}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteAdminProduct(productId: number) {
  return apiRequest<{ success: boolean; message: string }>(`/api/admin/products/${productId}`, {
    method: 'DELETE',
  });
}

export function getAdminOrders() {
  return apiRequest<{ success: boolean; orders: any[] }>('/api/admin/orders');
}

export function updateAdminOrderStatus(orderId: number, status: string) {
  return apiRequest<{ success: boolean; order: any }>(`/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export function getAdminUsers() {
  return apiRequest<{ success: boolean; users: AdminUser[] }>('/api/admin/users');
}

export function updateAdminUserStatus(userId: number, active: boolean) {
  return apiRequest<{ success: boolean; user: AdminUser }>(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    body: { active },
  });
}

export function getCategories() {
  return apiRequest<{ success: boolean; data: CategoryOption[]; count: number }>('/api/categories');
}

export function createCategory(payload: { categoryName: string; description: string }) {
  return apiRequest<{ success: boolean; data: CategoryOption }>('/api/categories', {
    method: 'POST',
    body: payload,
  });
}

export function updateCategory(categoryId: number, payload: { categoryName: string; description: string }) {
  return apiRequest<{ success: boolean; data: CategoryOption }>(`/api/categories/${categoryId}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteCategory(categoryId: number) {
  return apiRequest<{ success: boolean; message: string }>(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export function getAdminSiteSettings() {
  return getAdminSettings();
}

export function saveAdminSiteSettings(settings: Record<string, string>) {
  return updateAdminSettings(settings);
}
