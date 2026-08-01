import type { ApiErrorResponse } from '../lib/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

export class ApiClientError extends Error {
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, details?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiClientError';
    this.status = details?.status;
    this.fieldErrors = details?.fieldErrors;
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiRequest<T>(
  endpoint: string,
  init: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = init;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiClientError(
      data?.message || data?.error || 'Request failed',
      data as ApiErrorResponse,
    );
  }

  return data as T;
}

export { BASE_URL };
