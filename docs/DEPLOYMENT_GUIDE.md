# OUTLOOX Deployment Guide

Date: 2026-07-31

## Production Architecture

- Frontend: Vite static build served by nginx, Vercel, Netlify, or similar.
- Backend: Spring Boot Java 21 service.
- Database: MySQL 8+ with managed backups.
- Assets: Cloudinary.
- Payments: Razorpay live keys plus webhook secret.
- Transport: HTTPS only.

## Build Commands

Frontend:

```bash
cd frontend
npm install
npm run build
```

Backend:

```bash
cd backend
mvnw.cmd -DskipTests package
```

On Windows PowerShell, use `npm.cmd run build` if script execution blocks `npm.ps1`.

## Docker Run

From project root:

```bash
docker compose up --build
```

Default local services:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:9090`
- MySQL: `localhost:3306`

## Backend Environment Variables

Required for production:

- `SERVER_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `APP_FRONTEND_URL`
- `APP_CORS_ALLOWED_ORIGINS`
- `APP_COOKIE_SECURE`
- `APP_COOKIE_SAME_SITE`
- `APP_COOKIE_DOMAIN`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`

Recommended production values:

- `APP_COOKIE_SECURE=true`
- `APP_COOKIE_SAME_SITE=Lax` for same-site deployments
- `APP_COOKIE_SAME_SITE=None` only for cross-site cookie deployments over HTTPS
- `APP_SEED_DEMO_CATALOG=false` after real catalog data is loaded
- `JPA_SHOW_SQL=false`

## Frontend Environment Variables

- `VITE_API_BASE_URL=https://api.your-domain.com`
- `VITE_SITE_URL=https://your-domain.com`

## Razorpay Setup

1. Configure live key id and secret in backend env vars.
2. Configure webhook URL: `/api/payments/webhook`.
3. Store webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
4. Verify payment success only through backend `/api/payments/verify` response.

## Database

- Flyway is enabled and JPA runs in validate mode.
- Back up MySQL before deploying new migrations.
- Do not use `ddl-auto=update` in production.

## Go-Live Checklist

- Rotate any credential that was previously present in source history.
- Configure exact CORS origins.
- Enable HTTPS and secure cookies.
- Run frontend and backend production builds.
- Test registration, login, product listing, cart, checkout, Razorpay payment, webhook, refund, cancellation, admin product CRUD, admin order status, and profile flows.
- Confirm database backups and restore drills.
