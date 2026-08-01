import { chromium } from 'playwright';
import fs from 'fs';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, colorScheme: 'dark' });

const authUser = { authenticated: true, username: 'vikas', email: 'vikas@outloox.in', role: 'CUSTOMER' };
const addresses = {
  success: true,
  addresses: [
    {
      addressId: 1,
      fullName: 'Vikas Pandit',
      phone: '9876543210',
      addressLine: '221B Linking Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400050',
      country: 'India',
      default: true,
    },
    {
      addressId: 2,
      fullName: 'Vikas Pandit',
      phone: '9876543210',
      addressLine: '44 MG Road, Indore',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452001',
      country: 'India',
      default: false,
    }
  ]
};
const orders = {
  success: true,
  orders: [
    {
      orderId: 1201,
      totalAmount: 4898,
      orderStatus: 'SHIPPED',
      paymentStatus: 'PAID',
      orderDate: new Date().toISOString(),
      paymentMethod: 'RAZORPAY',
      shippingAddress: addresses.addresses[0],
      items: [
        { orderItemId: 1, productId: 1, productName: 'Oversized Black Tee', productImage: '/products/oversized-black-tee.svg', size: 'L', color: 'Black', quantity: 2, price: 1299, totalPrice: 2598 },
        { orderItemId: 2, productId: 3, productName: 'OX Signature Sneaker', productImage: '/products/ox-signature-sneaker.svg', size: 'UK 9', color: 'Monochrome', quantity: 1, price: 3499, totalPrice: 3499 }
      ]
    }
  ]
};
const cart = {
  success: true,
  items: [
    { cartItemId: 1, productId: 1, productName: 'Oversized Black Tee', productImage: '/products/oversized-black-tee.svg', size: 'L', color: 'Black', price: 1299, quantity: 2, totalPrice: 2598 },
    { cartItemId: 2, productId: 3, productName: 'OX Signature Sneaker', productImage: '/products/ox-signature-sneaker.svg', size: 'UK 9', color: 'Monochrome', price: 3499, quantity: 1, totalPrice: 3499 }
  ],
  subtotal: 6097,
  shipping: 0,
  total: 6097,
  itemCount: 3,
};
const profile = { userId: 7, username: 'vikas', email: 'vikas@outloox.in', role: 'CUSTOMER', joinDate: 'Member since 2026-01-10' };

await context.route('**/api/auth/verify', route => route.fulfill({ json: authUser }));
await context.route('**/api/user/profile', route => {
  if (route.request().method() === 'GET') return route.fulfill({ json: profile });
  return route.fulfill({ json: { message: 'Profile updated successfully' } });
});
await context.route('**/api/user/check-role', route => route.fulfill({ json: { authenticated: true, username: 'vikas', isAdmin: false } }));
await context.route('**/api/auth/logout', route => route.fulfill({ json: { message: 'Logged out successfully' } }));
await context.route('**/api/cart', route => {
  const method = route.request().method();
  if (method === 'GET') return route.fulfill({ json: cart });
  return route.fulfill({ json: { success: true } });
});
await context.route('**/api/cart/**', route => route.fulfill({ json: { success: true } }));
await context.route('**/api/user/addresses', route => {
  if (route.request().method() === 'GET') return route.fulfill({ json: addresses });
  return route.fulfill({ json: { success: true, message: 'Address added successfully', address: addresses.addresses[0] } });
});
await context.route('**/api/user/addresses/**', route => route.fulfill({ json: { success: true, message: 'Updated' } }));
await context.route('**/api/orders', route => route.fulfill({ json: orders }));
await context.route('**/api/orders/1201', route => route.fulfill({ json: { success: true, order: orders.orders[0] } }));
await context.route('**/api/orders/checkout', route => route.fulfill({ json: { orderId: 1201, orderStatus: 'PENDING', totalAmount: 6097, paymentStatus: 'PENDING', message: 'Order created. Complete payment to confirm it.' } }));
await context.route('**/api/payments/create-order', route => route.fulfill({ json: { keyId: 'rzp_test_xxx', internalOrderId: 1201, razorpayOrderId: 'order_test_123', amount: 609700, currency: 'INR' } }));
await context.route('**/api/payments/verify', route => route.fulfill({ json: { verified: true, message: 'Payment verified successfully', orderId: 1201, paymentStatus: 'PAID', orderStatus: 'PAID' } }));

const page = await context.newPage();
const base = 'http://127.0.0.1:4173';
const shots = [
  ['home', '/'],
  ['shop', '/shop'],
  ['product-detail', '/product/oversized-black-tee'],
  ['cart', '/cart'],
  ['checkout', '/checkout'],
  ['profile', '/profile'],
  ['order-detail', '/orders/1201'],
  ['login', '/login'],
  ['register', '/register'],
  ['about', '/about']
];

for (const [name, path] of shots) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `ui-screenshots/${name}.png`, fullPage: true });
}

await browser.close();

const gallery = `<!doctype html><html><head><meta charset="utf-8"><title>OUTLOOX UI Screenshots</title><style>body{font-family:Arial,sans-serif;background:#111;color:#fff;margin:0;padding:24px}h1{margin-top:0} .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}.card{background:#1a1a1a;padding:16px;border-radius:16px;border:1px solid #333}.card img{width:100%;border-radius:12px;border:1px solid #444} .label{margin:0 0 12px;font-weight:700;color:#c4b5fd;text-transform:uppercase;letter-spacing:.08em;font-size:12px}</style></head><body><h1>OUTLOOX UI Screenshots</h1><div class="grid">${shots.map(([name])=>`<div class="card"><p class="label">${name}</p><img src="./${name}.png" alt="${name}"></div>`).join('')}</div></body></html>`;
fs.writeFileSync('ui-screenshots/gallery.html', gallery);
