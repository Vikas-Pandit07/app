import type { AuthUser, LoginPayload, RegisterPayload } from '../lib/types';
import { apiRequest } from './apiClient';

export interface VerifyAuthResponse {
  authenticated: boolean;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  username: string;
  email: string;
  token: string;
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<{ username: string; email: string }>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function logoutUser() {
  return apiRequest<{ message: string }>('/api/auth/logout', {
    method: 'POST',
  });
}

export function verifyAuth() {
  return apiRequest<VerifyAuthResponse>('/api/auth/verify');
}

export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export function resetPassword(payload: { token: string; newPassword: string; confirmPassword: string }) {
  return apiRequest<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: payload,
  });
}

export function toAuthUser(data: VerifyAuthResponse): AuthUser {
  return {
    username: data.username,
    email: data.email,
    role: data.role,
  };
}
