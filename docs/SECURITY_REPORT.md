# OUTLOOX Security Report

Date: 2026-07-31

## Security Status

The application now has a credible production security baseline: Spring Security, JWT HttpOnly cookie auth, BCrypt password hashing, role-based admin authorization, validation, structured exception handling, configurable CORS, basic security headers, and rate limiting for sensitive endpoints.

## Fixes In This Pass

- Removed hardcoded email credentials from backend configuration defaults.
- Preserved env-driven mail, Razorpay, Cloudinary, JWT, cookie, and CORS configuration.
- Tightened payment verification by checking Razorpay amount and currency in addition to signature, order id, and status.
- Ensured refund webhooks restore stock when the order had previously consumed inventory.
- Removed frontend mock product fallback so users do not see fake inventory during API failure.
- Fixed frontend build errors and corrupted display text.

## Existing Protections Confirmed

- ADMIN endpoints require ADMIN role.
- JWT filter authenticates active users only and clears security context on invalid tokens.
- Auth failures and authorization failures return JSON handlers.
- Passwords are hashed with BCrypt strength 12.
- DTO validation is present on auth, cart, checkout, product, payment, and admin status requests.
- Forgot-password avoids account enumeration behavior.
- Rate limiting protects auth/payment paths in a single JVM instance.

## Required Production Settings

- Set `JWT_SECRET` to a random 32+ character secret.
- Set `APP_COOKIE_SECURE=true` behind HTTPS.
- Use `APP_COOKIE_SAME_SITE=Lax` for same-site frontend/backend or `None` only when cross-site cookies are required with HTTPS.
- Set `APP_CORS_ALLOWED_ORIGINS` to exact frontend origins.
- Keep all mail, Razorpay, Cloudinary, database, and JWT secrets only in deployment environment variables.
- Rotate the exposed mail app password that previously existed in source history.

## Remaining Security Recommendations

- Add Redis-backed distributed rate limiting before multi-instance deployment.
- Add CSRF protection if cross-site cookie authentication is used in production.
- Add webhook event idempotency persistence.
- Add admin audit logs for product changes, status changes, refunds, and user management.
- Add CI secret scanning, dependency scanning, SAST, and branch protection.
- Add CSP and additional headers at nginx/CDN layer.

## Secret Hygiene Update - 2026-07-31

`docker-compose.yml` and backend application defaults were checked for leaked live/test credentials and now use environment-driven placeholders. Any credentials previously exposed in local files or git history should still be rotated before production use.
