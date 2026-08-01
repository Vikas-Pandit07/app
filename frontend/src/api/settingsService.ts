import { apiRequest } from './apiClient';

export function getPublicSettings() {
  return apiRequest<{ success: boolean; settings: Record<string, string> }>('/api/settings');
}

export function getAdminSettings() {
  return apiRequest<{ success: boolean; settings: Array<{ key: string; value: string }> }>('/api/admin/settings');
}

export function updateAdminSettings(settings: Record<string, string>) {
  return apiRequest<{ success: boolean; settings: Array<{ key: string; value: string }> }>('/api/admin/settings', {
    method: 'PUT',
    body: { settings },
  });
}
