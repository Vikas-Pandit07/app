# OUTLOOX Frontend

A clean React + Vite storefront based on the UI you shared.

## What is included

- Home page
- Shop page with search, category filters, sorting, and price slider
- Product detail page
- Cart page
- Checkout page
- About page
- Dark / light theme switch
- Local cart persistence via `localStorage`
- Responsive layout

## Run locally

```bash
cd outloox
npm install
npm run dev
```

Open: `http://localhost:5173`

## Build for production

```bash
npm run build
npm run preview
```

## Current state

This frontend is production-style UI and fully runnable.

Right now it uses local product data and local cart state.
That means it is perfect for:
- UI development
- deployment preview
- product showcase
- converting your design into a working website

## To connect the Spring Boot backend from your old repo

You should connect these frontend areas to backend APIs next:

1. Product list -> `/api/products`
2. Product detail -> `/api/products/{id}`
3. Auth -> `/api/auth/*`
4. Cart -> `/api/cart/*`
5. Checkout / orders -> `/api/orders/*`
6. Payments -> `/api/payments/*`

## Suggested next upgrade

For your exact UI, the backend should support:

- product slug
- original price
- badge (`sale`, `new`, `bestseller`)
- colors
- sizes
- rating
- reviews count
- order items with selected size and color

See `../repo/OUTLOOX_BACKEND_MIGRATION.md` for the backend conversion checklist.
