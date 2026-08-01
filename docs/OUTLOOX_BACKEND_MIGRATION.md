# OUTLOOX Backend Migration Notes

This backend is now aligned far more closely to the OUTLOOX storefront.

## Completed in current codebase
- OUTLOOX package naming in backend (`com.outloox`)
- richer product catalog fields
- product slug support
- size/color persistence in cart items
- size/color persistence in order items
- security hardening improvements
- Razorpay verification/webhook flow improvements
- Flyway-based schema management
- deployment artifacts

## Still optional future upgrades

### 1) Per-variant inventory
Current stock is still product-level.
If you need separate stock for each combination like:
- Black / M
- Black / L
- White / M

then add a `product_variants` table.

### 2) Admin product media workflow
Right now image URLs can be supplied directly or uploaded separately.
A richer media manager can be added later.

### 3) Review system
The catalog supports rating/review counts, but a full customer review subsystem is still a future enhancement.

### 4) Promotions / coupons
Not yet implemented.

## Recommendation
For launch, the current architecture using MySQL + richer product catalog + product-level stock is a strong and practical approach.
If your brand scales with more SKUs and variant-sensitive inventory, then evolve to variant-level stock tables next.
