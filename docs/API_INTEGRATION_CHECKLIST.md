# API Integration Checklist

## Status: READY FOR TESTING

All API endpoints are implemented on both frontend and backend. This document tracks what's working and what needs verification.

---

## ✅ IMPLEMENTED & WORKING

### Products API

- **Backend**: `GET /api/products` - List products with category filter
- **Backend**: `GET /api/products/{id}` - Get single product
- **Frontend**: `productService.getProducts()` - Fetches products
- **Frontend**: `useProducts()` - Context hook with fallback to mock data
- **Status**: Seeded via `DemoCatalogSeeder` on dev startup

### Authentication API

- **Backend**: POST `/api/auth/register` - User registration
- **Backend**: POST `/api/auth/login` - User login (JWT cookie)
- **Backend**: POST `/api/auth/logout` - Logout
- **Backend**: GET `/api/auth/me` - Get current user
- **Frontend**: `authService.login()`, `authService.register()`
- **Frontend**: `useAuth()` context with auto-refresh
- **Status**: Fully integrated

### Address API

- **Backend**: GET `/api/addresses` - Get user addresses
- **Backend**: POST `/api/addresses` - Add new address
- **Backend**: PUT `/api/addresses/{id}` - Update address
- **Backend**: DELETE `/api/addresses/{id}` - Delete address
- **Frontend**: `addressService.getUserAddresses()`, `addressService.addUserAddress()`
- **Status**: Integrated in checkout flow

### Cart API

- **Backend**: GET `/api/cart` - Get cart items & summary
- **Backend**: POST `/api/cart/items` - Add product to cart
- **Backend**: PUT `/api/cart/items/{id}` - Update quantity
- **Backend**: DELETE `/api/cart/items/{id}` - Remove item
- **Backend**: DELETE `/api/cart` - Clear cart
- **Backend**: GET `/api/cart/count` - Get item count
- **Frontend**: `cartService.*` - All methods implemented
- **Frontend**: `useCart()` context with guest/logged-in sync
- **Status**: Ready to test

### Order API

- **Backend**: POST `/api/orders/checkout` - Create order
- **Backend**: GET `/api/orders` - List user orders
- **Backend**: GET `/api/orders/{id}` - Get order details
- **Backend**: PUT `/api/orders/{id}/status` - Update order status (admin)
- **Frontend**: `orderService.checkoutOrder()`, `orderService.getOrders()`
- **Status**: Integrated in checkout, order detail pages

### Payment API (Razorpay)

- **Backend**: POST `/api/payments/create-order` - Create Razorpay order
- **Backend**: POST `/api/payments/verify` - Verify payment signature
- **Backend**: POST `/api/payments/webhook` - Razorpay webhook handler
- **Frontend**: `paymentService.createPaymentOrder()`, `paymentService.verifyPayment()`
- **Frontend**: Razorpay checkout modal integrated
- **Status**: Ready to test with Razorpay keys

### User Profile API

- **Backend**: GET `/api/users/profile` - Get user profile
- **Backend**: PUT `/api/users/profile` - Update profile
- **Frontend**: `profileService.*` - Implemented
- **Status**: Integrated in profile page

---

## ⚠️ NEEDS TESTING

### Product Images

- **Status**: Backend fetches from `ProductImage` table
- **Issue**: Need to verify Cloudinary integration for image uploads
- **Test**: Upload product via admin, check image display

### Cart Quantity Updates

- **Status**: Code exists but needs end-to-end test
- **Test**:
  1. Add item to cart
  2. Increase quantity
  3. Verify backend updates
  4. Refresh page, verify persisted

### Checkout Flow

- **Status**: All pieces exist, needs full flow test
- **Test**:
  1. Login
  2. Add item to cart
  3. Go to checkout
  4. Save/select address
  5. Place order (COD first, then Razorpay test)
  6. Verify order created in DB
  7. Check order history

### Payment Verification

- **Status**: Backend signature verification ready
- **Issue**: Needs Razorpay test account configured
- **Test**: Use Razorpay test keys, complete a test payment

### Stock Management

- **Status**: Backend deducts stock on payment confirmation
- **Issue**: No frontend notification of stock changes
- **Test**: Check inventory updates after purchase

---

## 🔄 TODO - MISSING FEATURES

### Frontend Features Not Yet Implemented

1. **Order Status Updates**
   - UI for showing shipping/delivery status
   - Real-time order status via WebSocket (optional)
   - Status: Design exists, backend ready

2. **Product Reviews**
   - Submit review endpoint exists
   - Frontend UI missing
   - Status: Backend ready, needs UI

3. **Wishlist**
   - Context exists, API missing
   - Status: Needs implementation

4. **Search**
   - Search across products needs backend endpoint
   - Status: Mock implementation exists, needs API

5. **Email Notifications**
   - Order confirmation emails
   - Shipping updates
   - Status: Backend ready, needs integration

6. **Admin Dashboard**
   - Product management (create, update, delete)
   - Order management
   - Status: Backend APIs exist, frontend minimal

---

## 🧪 TESTING INSTRUCTIONS

### 1. Basic Setup

```bash
# Terminal 1: Start MySQL
docker run --name outloox-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=outloox \
  -p 3306:3306 \
  -d mysql:8.4

# Terminal 2: Start Backend
cd backend
mvn spring-boot:run

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

### 2. Product API Test

```bash
# Check products are loaded
curl http://localhost:9090/api/products
# Should return 12 seeded products

# Check single product
curl http://localhost:9090/api/products/1
```

### 3. Authentication Flow

1. Open http://localhost:5173
2. Click "Login"
3. Register: `testuser` / `test@example.com` / `password123`
4. Login with same credentials
5. Check user is stored in JWT cookie

### 4. Cart Flow

1. Stay logged in
2. Click product card → "Add to Cart"
3. Check cart icon updates
4. Adjust quantity in cart
5. Verify cart persists on page refresh

### 5. Checkout Flow

1. In cart, click "Checkout"
2. Add shipping address
3. Select address
4. Choose payment method (COD)
5. Place order
6. Verify order appears in order history

### 6. Payment Test

1. Go to checkout with payment method = "Online"
2. Razorpay modal should open
3. Use test card: `4111 1111 1111 1111`
4. Complete test payment
5. Verify order status changes to "paid"

---

## 🐛 KNOWN ISSUES TO FIX

1. **Mock Data Fallback**
   - If API fails, frontend uses mock products
   - **Fix**: Need better error UI, not silent fallback

2. **Rate Limiting**
   - Auth endpoints have rate limits
   - **Risk**: Too strict in dev (20 requests/60s)
   - **Fix**: Should only apply in prod

3. **CORS Configuration**
   - Hardcoded in some controllers
   - **Fix**: Use centralized CORS bean

4. **Error Messages**
   - Some backend errors are generic
   - **Fix**: Add specific validation messages

5. **Stock Display**
   - Product stock shows but no low-stock warnings
   - **Fix**: Add "Only X left" message when < 5 items

---

## 📋 PRE-LAUNCH REQUIREMENTS

Before going live:

- [ ] All API endpoints tested end-to-end
- [ ] Payment test flow passed
- [ ] Error cases handled (network, validation, payment decline)
- [ ] Performance tested (products load < 2s)
- [ ] Security: JWT secret changed
- [ ] Security: CORS limited to actual domain
- [ ] Database: Backups automated
- [ ] Email: Configured and tested
- [ ] Logging: Error tracking configured
- [ ] Monitoring: Uptime/error alerts configured

---

## 🚀 NEXT STEPS

1. **Run the test setup** (see Testing Instructions)
2. **Verify basic flows work**
3. **Document any issues found**
4. **Fix critical bugs**
5. **Deploy to staging**
6. **Performance test**
7. **Security audit**
8. **Go live!**
