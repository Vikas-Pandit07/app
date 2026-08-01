export type ProductCategory = 'men' | 'women' | 'sneakers' | 'accessories';
export type ProductBadge = 'sale' | 'new' | 'bestseller';

export interface Product {
  id: string;
  backendId: number;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  images: string[];
  colors: string[];
  sizes: string[];
  rating: number;
  reviews: number;
  badge?: ProductBadge | string;
  status?: string;
  description: string;
  features: string[];
  inStock: boolean;
  stock: number;
  source?: 'api' | 'mock';
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
  backendItemId?: number;
}

export interface OrderDetails {
  email: string;
  fullName: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  paymentMethod: 'cod' | 'upi' | 'card';
}

export interface BackendProductResponse {
  productId: number;
  slug?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  inStock?: boolean;
  category: string;
  images: string[];
  colors?: string[];
  sizes?: string[];
  features?: string[];
  rating?: number;
  reviews?: number;
  badge?: string;
  status?: string;
}

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export interface AuthUser {
  username: string;
  email: string;
  role: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface Address {
  addressId: number;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  default: boolean;
}

export interface AddressPayload {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface ProfileResponse {
  userId: number;
  username: string;
  email: string;
  role: string;
  joinDate: string;
}

export interface OrderItem {
  orderItemId: number;
  productId: number;
  productName: string;
  productImage?: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderResponse {
  orderId: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  orderDate: string;
  paymentMethod: string;
  shippingAddress: Address;
  items: OrderItem[];
}

export interface CartSummaryResponse {
  success: boolean;
  items: Array<{
    cartItemId: number;
    productId: number;
    productName: string;
    productImage?: string;
    size?: string;
    color?: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export interface PaymentOrderResponse {
  keyId: string;
  internalOrderId: number;
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

export interface PaymentVerifyResponse {
  verified: boolean;
  message: string;
  orderId: number;
  paymentStatus: string;
  orderStatus: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}
