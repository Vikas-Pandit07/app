import type { ProfileResponse } from '../lib/types';
import { apiRequest } from './apiClient';

export function getProfile() {
  return apiRequest<ProfileResponse>('/api/user/profile');
}

export function updateProfile(payload: { username: string; email: string }) {
  return apiRequest<{ message: string }>('/api/user/profile', {
    method: 'PUT',
    body: payload,
  });
}

export function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return apiRequest<{ message: string }>('/api/user/change-password', {
    method: 'PUT',
    body: payload,
  });
}

export function checkRole() {
  return apiRequest<{ authenticated: boolean; username: string; isAdmin: boolean }>('/api/user/check-role');
}
