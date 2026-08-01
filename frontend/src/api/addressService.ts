import type { Address, AddressPayload } from '../lib/types';
import { apiRequest } from './apiClient';

export function getUserAddresses() {
  return apiRequest<{ success: boolean; addresses: Address[] }>('/api/user/addresses');
}

export function addUserAddress(payload: AddressPayload) {
  return apiRequest<{ success: boolean; message: string; address: Address }>('/api/user/addresses', {
    method: 'POST',
    body: payload,
  });
}

export function updateUserAddress(addressId: number, payload: Partial<AddressPayload>) {
  return apiRequest<{ success: boolean; message: string; address: Address }>(`/api/user/addresses/${addressId}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteUserAddress(addressId: number) {
  return apiRequest<{ success: boolean; message: string }>(`/api/user/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

export function setDefaultAddress(addressId: number) {
  return apiRequest<{ success: boolean; message: string }>(`/api/user/addresses/${addressId}/default`, {
    method: 'PUT',
  });
}
