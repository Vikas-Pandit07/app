# OUTLOOX Audit Report

Date: 2026-07-31
Scope: `outloox-production-ready-v9` full stack: Spring Boot backend, React/Vite frontend, Flyway migrations, Docker assets, API integration, checkout/payment/order/admin flows.

## Executive Summary

The main project is a solid production-track e-commerce platform with real backend APIs, JWT cookie auth, admin APIs, Flyway migrations, Razorpay integration, email flows, and API-connected frontend contexts. This pass removed leaked default credentials, removed accidental non-source artifacts, fixed frontend build blockers, removed mock catalog fallback behavior, tightened Razorpay verification, restored stock on refund webhooks, and fixed online checkout cart duplication risk.

Both production builds pass after changes:

- Frontend: `npm.cmd run build`
- Backend: `cmd.exe /c mvnw.cmd -DskipTests package`

## Architecture Snapshot

- Frontend: React, TypeScript, Vite, TailwindCSS, Framer Motion, route lazy loading, protected routes, auth/cart/product/order/profile/admin contexts.
- Backend: Java 21, Spring Boot 3.3.2, Spring Security, JWT HttpOnly cookie auth, JPA/Hibernate, Flyway, MySQL, Spring Mail, Razorpay, Cloudinary.
- Database: Flyway V1-V3 migrations with indexes, constraints, foreign keys, order/payment state fields, variants, settings, and password reset tokens.
- Deployment: Dockerfiles for frontend/backend, nginx config, docker-compose, production docs under `docs/`.

## Critical Issues Fixed

- Removed hardcoded Gmail username and app password defaults from `application.properties`.
- Removed accidental backend artifacts: stray command files and temporary Flyway troubleshooting files.
- Removed mock product fallback from production product context so catalog/inventory failures are visible.
- Fixed frontend TypeScript build errors in error boundary and icon typing.
- Fixed corrupted customer-facing text and price formatting.
- Cleared cart after order snapshot creation for both COD and online checkout to prevent duplicate pending orders.
- Added Razorpay payment amount and currency validation during verification.
- Added stock restoration when Razorpay refund webhook is received.

## Security Issues

- Cookie-based JWT auth is configured with HttpOnly cookies and configurable secure/same-site/domain attributes.
- Method security is enabled and admin APIs require ADMIN role.
- CORS is configurable and should be restricted to exact production origins.
- Rate limiting exists in-memory for auth/payment endpoints; Redis-backed rate limiting is recommended for multi-instance production.
- JWT secret must be a strong production secret from env vars only.
- CSRF remains disabled; because auth uses cookies, keep SameSite strict enough for the deployment topology and consider CSRF tokens for state-changing browser endpoints if cross-site cookies are required.

## Payment Findings

- Razorpay order creation, signature verification, payment fetch, webhook signature validation, status tracking, and refund initiation are implemented.
- Verification now checks signature, order id, captured/authorized status, amount, and INR currency.
- Fake client-side success cannot mark an order paid without a valid Razorpay signature and matching fetched payment.
- Recommended next hardening: persist webhook event IDs/idempotency records to prevent replay processing across restarts.

## Inventory Findings

- Product stock exists and order payment/COD stock deduction uses pessimistic locking.
- Online orders no longer deduct stock at checkout; deduction happens after verified Razorpay payment.
- COD deducts stock immediately at order placement.
- Cancellation/refund paths restore stock when appropriate.
- Launch limitation: inventory is product-level, not per size/color variant.

## Performance And Scalability

- Frontend uses code splitting and route lazy loading.
- Backend disables Open Session in View and uses indexed schema fields.
- Some list APIs are still unpaginated and should be paginated before high-traffic launch: admin orders/users/products and user order history.
- Some response mapping can cause N+1 image/order-item lookups under large catalogs; add fetch joins/projections for scale.

## Deployment Issues

- `.env` exists locally and must not contain production secrets committed to source.
- Production must provide all required env vars documented in `DEPLOYMENT_GUIDE.md`.
- Use MySQL 8+, Java 21, HTTPS, exact CORS origins, `APP_COOKIE_SECURE=true`, and Razorpay live webhook configuration.

## Missing Or Future Features

- Variant-level stock by size/color.
- Redis/distributed rate limiting and session revocation/refresh token strategy.
- Webhook event persistence/idempotency table.
- Full automated integration tests for checkout/payment/order transitions.
- CI with dependency scanning, secret scanning, backend tests, frontend build, and Docker build.

## UI Launch Pass - 2026-07-31

The frontend has been moved away from a purple/dark generated look toward the supplied OUTLOOX reference: clean white storefront, black navigation/footer accents, squared product cards, restrained hover states, and more realistic retail spacing. Remaining visual polish should be done with actual brand photography/product shoots in Cloudinary.
