import type { Product } from './types';

const mockStock = 50;

function createProduct(product: Omit<Product, 'backendId' | 'slug' | 'stock' | 'source'>, backendId: number): Product {
  return {
    ...product,
    backendId,
    slug: product.id,
    stock: mockStock,
    source: 'mock',
  };
}

export const products: Product[] = [
  createProduct({ id: 'oversized-black-tee', name: 'Oversized Black Tee', price: 1299, originalPrice: 1699, category: 'men', images: ['/products/oversized-black-tee.svg'], colors: ['Black', 'White', 'Grey', 'Olive'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.7, reviews: 128, badge: 'sale', description: 'Premium 240 GSM cotton with a relaxed oversized fit. Minimal branding, maximum impact.', features: ['100% Premium Cotton', '240 GSM Heavyweight Fabric', 'Drop Shoulder Fit', 'Pre-shrunk'], inStock: true }, 1),
  createProduct({ id: 'urban-white-tee', name: 'Urban White Tee', price: 1199, originalPrice: 1499, category: 'men', images: ['/products/urban-white-tee.svg'], colors: ['White', 'Black', 'Beige'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.6, reviews: 96, badge: 'sale', description: 'Crisp white essential tee with subtle OUTLOOX chest branding. Built for the daily grind.', features: ['Soft-touch Cotton', 'Reinforced Collar', 'Regular Fit', 'Tagless Comfort'], inStock: true }, 2),
  createProduct({ id: 'ox-signature-sneaker', name: 'OX Signature Sneaker', price: 3499, originalPrice: 4499, category: 'sneakers', images: ['/products/ox-signature-sneaker.svg'], colors: ['Monochrome', 'Black/White', 'Grey'], sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'], rating: 4.9, reviews: 215, badge: 'bestseller', description: 'Chunky silhouette with breathable mesh and premium overlays. Built to perform, designed to stand out.', features: ['Breathable Mesh Upper', 'Cushioned Midsole', 'Durable Rubber Outsole', 'Reflective Details'], inStock: true }, 3),
  createProduct({ id: 'essential-hoodie', name: 'Essential Hoodie', price: 2199, originalPrice: 2999, category: 'men', images: ['/products/essential-hoodie.svg'], colors: ['Black', 'Grey', 'Olive', 'Brown'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.8, reviews: 175, badge: 'sale', description: 'Cozy fleece hoodie with kangaroo pocket and tonal embroidered logo. Your everyday armor.', features: ['Fleece-lined Interior', 'Kangaroo Pocket', 'Adjustable Hood', 'Ribbed Cuffs'], inStock: true }, 4),
  createProduct({ id: 'cargo-pants', name: 'Cargo Pants', price: 1899, originalPrice: 2499, category: 'men', images: ['/products/cargo-pants.svg'], colors: ['Black', 'Khaki', 'Olive'], sizes: ['28', '30', '32', '34', '36'], rating: 4.5, reviews: 87, badge: 'new', description: 'Relaxed cargo pants with multiple pockets and a tapered leg. Utility meets street style.', features: ['Cotton Twill Fabric', 'Multiple Cargo Pockets', 'Tapered Leg', 'Adjustable Cuffs'], inStock: true }, 5),
  createProduct({ id: 'ox-cap', name: 'OX Cap', price: 799, originalPrice: 999, category: 'accessories', images: ['/products/ox-cap.svg'], colors: ['Black', 'White', 'Olive'], sizes: ['One Size'], rating: 4.6, reviews: 45, badge: 'new', description: 'Minimal 6-panel cap with embroidered OX logo. Adjustable strap for the perfect fit.', features: ['6-Panel Construction', 'Embroidered Logo', 'Adjustable Strap', 'Curved Brim'], inStock: true }, 6),
  createProduct({ id: 'womens-oversized-tee', name: "Women's Oversized Tee", price: 1099, originalPrice: 1399, category: 'women', images: ['/products/womens-oversized-tee.svg'], colors: ['Black', 'White', 'Lavender', 'Sage'], sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.7, reviews: 62, badge: 'sale', description: 'Relaxed oversized tee with a slightly cropped silhouette. Soft, breathable, and effortlessly cool.', features: ['Soft Cotton Blend', 'Relaxed Fit', 'Cropped Hem', 'Minimal Logo'], inStock: true }, 7),
  createProduct({ id: 'womens-cropped-hoodie', name: 'Cropped Hoodie', price: 1799, originalPrice: 2299, category: 'women', images: ['/products/womens-cropped-hoodie.svg'], colors: ['Black', 'Grey', 'Dusty Pink'], sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.8, reviews: 53, badge: 'new', description: 'Cropped fleece hoodie with drawcord and ribbed hem. Perfect for layering.', features: ['Fleece Interior', 'Cropped Fit', 'Drawcord Hood', 'Ribbed Hem'], inStock: true }, 8),
  createProduct({ id: 'street-jacket', name: 'Street Jacket', price: 3299, originalPrice: 3999, category: 'men', images: ['/products/street-jacket.svg'], colors: ['Black', 'Olive', 'Brown'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], rating: 4.7, reviews: 41, badge: 'new', description: 'Utility-inspired street jacket with multiple pockets and a structured fit. Built for the elements.', features: ['Water-resistant Shell', 'Multiple Pockets', 'Full Zip Front', 'Adjustable Hood'], inStock: true }, 9),
  createProduct({ id: 'running-sneaker', name: 'Runner X Sneaker', price: 2999, originalPrice: 3799, category: 'sneakers', images: ['/products/running-sneaker.svg'], colors: ['Black', 'White', 'Violet'], sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'], rating: 4.6, reviews: 78, badge: 'sale', description: 'Lightweight runner with responsive cushioning and breathable upper. For those who move fast.', features: ['Lightweight Mesh', 'Responsive Foam', 'Flexible Outsole', 'Padded Collar'], inStock: true }, 10),
  createProduct({ id: 'tote-bag', name: 'OUTLOOX Tote', price: 599, originalPrice: 799, category: 'accessories', images: ['/products/tote-bag.svg'], colors: ['Black', 'White'], sizes: ['One Size'], rating: 4.5, reviews: 34, badge: 'sale', description: 'Heavy canvas tote with bold OUTLOOX print. Carry your essentials with attitude.', features: ['Heavy Canvas', 'Reinforced Handles', 'Inner Pocket', 'Screen-printed Logo'], inStock: true }, 11),
  createProduct({ id: 'womens-cargo-pants', name: "Women's Cargo Pants", price: 1699, originalPrice: 2199, category: 'women', images: ['/products/womens-cargo-pants.svg'], colors: ['Black', 'Beige', 'Olive'], sizes: ['XS', 'S', 'M', 'L', 'XL'], rating: 4.6, reviews: 49, badge: 'new', description: 'High-waisted cargo pants with a relaxed fit and tapered ankle. Streetwear staple.', features: ['High-waisted Fit', 'Side Cargo Pockets', 'Tapered Ankle', 'Belt Loops'], inStock: true }, 12),
];

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'accessories', label: 'Accessories' },
] as const;

export const featuredCollections = [
  { id: 'streetwear', title: 'Streetwear', subtitle: 'Oversized Fits', image: '/collections/streetwear.svg', link: '/shop?category=men' },
  { id: 'essentials', title: 'Essentials', subtitle: 'Daily Comfort', image: '/collections/essentials.svg', link: '/shop' },
  { id: 'sneakers', title: 'Sneakers', subtitle: 'Built to Perform', image: '/collections/sneakers.svg', link: '/shop?category=sneakers' },
  { id: 'limited', title: 'Limited Drop', subtitle: 'Exclusive Pieces', image: '/collections/limited.svg', link: '/shop' },
];

export const brandFeatures = [
  { title: 'Premium Quality', description: 'Premium fabrics and durable materials.' },
  { title: 'Trend Driven', description: 'Always ahead with modern designs.' },
  { title: 'Fast Shipping', description: 'Quick delivery across India.' },
  { title: 'Secure Payments', description: '100% secure and trusted checkout.' },
  { title: 'Easy Returns', description: 'Hassle-free returns within 7 days.' },
];

export function formatPrice(amount: number) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function calculateDiscount(price: number, originalPrice?: number) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
