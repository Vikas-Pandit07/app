import { products as fallbackProducts } from './data';
import type { BackendProductResponse, Product, ProductCategory } from './types';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeCategory(category: string): ProductCategory {
  const value = category.toLowerCase();
  if (value.includes('women')) return 'women';
  if (value.includes('sneaker') || value.includes('shoe')) return 'sneakers';
  if (value.includes('access')) return 'accessories';
  return 'men';
}

function findFallback(source: { name: string }) {
  return fallbackProducts.find((item) => item.name.toLowerCase() === source.name.toLowerCase());
}

export function adaptBackendProduct(input: BackendProductResponse): Product {
  const fallback = findFallback(input);
  const category = normalizeCategory(input.category || fallback?.category || 'men');
  const slug = input.slug || fallback?.slug || slugify(input.name);
  const images = input.images?.length ? input.images : fallback?.images || ['/placeholder-product.svg'];

  return {
    id: slug,
    backendId: input.productId,
    slug,
    name: input.name,
    price: Number(input.price),
    originalPrice: input.originalPrice ? Number(input.originalPrice) : fallback?.originalPrice,
    category,
    images,
    colors: input.colors?.length ? input.colors : fallback?.colors || ['Standard'],
    sizes: input.sizes?.length ? input.sizes : fallback?.sizes || ['Standard'],
    rating: typeof input.rating === 'number' ? input.rating : fallback?.rating || 4.6,
    reviews: typeof input.reviews === 'number' ? input.reviews : fallback?.reviews || 0,
    badge: input.badge || fallback?.badge,
    description: input.description || fallback?.description || 'Premium OUTLOOX product.',
    features: input.features?.length ? input.features : fallback?.features || ['Premium Construction', 'Street-ready Fit', 'Designed for Everyday Wear'],
    inStock: typeof input.inStock === 'boolean' ? input.inStock : Number(input.stock) > 0,
    stock: Number(input.stock),
    source: 'api',
  };
}

export function buildProductStub(payload: {
  productId: number;
  name: string;
  price: number;
  image?: string;
}): Product {
  const fallback = findFallback({ name: payload.name });
  const slug = fallback?.slug || slugify(payload.name);
  return {
    id: slug,
    backendId: payload.productId,
    slug,
    name: payload.name,
    price: Number(payload.price),
    originalPrice: fallback?.originalPrice,
    category: fallback?.category || 'men',
    images: [payload.image || fallback?.images[0] || '/placeholder-product.svg'],
    colors: fallback?.colors || ['Standard'],
    sizes: fallback?.sizes || ['Standard'],
    rating: fallback?.rating || 4.6,
    reviews: fallback?.reviews || 0,
    badge: fallback?.badge,
    status: fallback?.status,
    description: fallback?.description || 'OUTLOOX product',
    features: fallback?.features || ['Premium Construction'],
    inStock: true,
    stock: 999,
    source: payload.image ? 'api' : 'mock',
  };
}
