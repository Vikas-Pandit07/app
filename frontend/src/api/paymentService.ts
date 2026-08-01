import type { PaymentOrderResponse, PaymentVerifyResponse } from '../lib/types';
import { apiRequest } from './apiClient';

export function createPaymentOrder(orderId: number) {
  return apiRequest<PaymentOrderResponse>('/api/payments/create-order', {
    method: 'POST',
    body: { orderId },
  });
}

export function verifyPayment(payload: {
  internalOrderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return apiRequest<PaymentVerifyResponse>('/api/payments/verify', {
    method: 'POST',
    body: payload,
  });
}
