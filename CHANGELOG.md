# Changelog

## 2026-06-22 - Production hardening pass

### Backend
- renamed backend package and application naming to `com.outloox` / OUTLOOX branding
- added method-level security enablement
- added JSON auth entrypoint and access denied handler
- added in-memory rate limiting filter for auth/payment APIs
- centralized auth cookie creation
- improved CORS configurability
- hardened JWT handling
- improved global exception responses
- added validation to multiple DTOs
- normalized registration/login/profile email handling
- prevented forgot-password account enumeration
- implemented welcome email, order confirmation email, payment success email, and shipping update email flows
- fixed admin product response bug (`null` return)
- fixed admin order sort field typo
- expanded order lifecycle enum
- moved online stock deduction to payment-confirmation stage
- added Razorpay webhook handling
- added refund support hook
- added stock restoration on cancellation/refund flows
- aligned shipping thresholds with frontend expectations
- added size/color variant support to cart + order items
- updated cart repository/service logic to merge by product+size+color
- enriched product catalog with slug, original price, badge, rating, reviews, colors, sizes, features
- added demo catalog seeder for local development
- switched schema strategy toward Flyway migrations with JPA validation
- added Dockerfile, prod properties, migration SQL artifacts

### Frontend
- added route lazy loading with suspense fallback
- improved SEO metadata in `index.html`
- added `robots.txt`
- added `sitemap.xml`
- added frontend `.env.example`
- added Dockerfile and nginx config
- connected frontend auth, products, cart, checkout, profile, and orders to backend APIs
- updated storefront to consume slug-based richer product payloads
- added wishlist page and local wishlist management
- improved logged-in UI outcome with account-aware navigation and homepage personalization
- added an admin dashboard UI for products, orders, users, categories, and public site settings

### Catalog / Variant model
- added richer product catalog fields: slug, originalPrice, badge, rating, reviews, colors, sizes, features
- added dev demo catalog seeder for local environments
- enabled cart and order variant persistence with size/color
- kept product-level inventory as the recommended launch-safe model
- added public/admin site settings support for editable frontend content
- added Flyway-based runtime migrations and switched JPA to validation mode

### Documentation
- added `AUDIT_REPORT.md`
- added `SECURITY_REPORT.md`
- added `DEPLOYMENT_GUIDE.md`
- added database migration notes / SQL

## 2026-07-31 - Launch readiness cleanup

### Security
- Removed hardcoded email credential defaults from backend configuration.
- Documented required credential rotation and env-only secret handling.

### Payments and inventory
- Added Razorpay amount and currency verification before marking payments successful.
- Restored stock on Razorpay refund webhook processing.
- Cleared checkout cart after order snapshot creation to prevent duplicate pending online orders.

### Frontend
- Removed mock catalog fallback from production product provider.
- Fixed TypeScript production build issues for error boundary and React icon typing.
- Fixed corrupted price/loading/search display text.

### Repository hygiene
- Removed accidental backend command artifacts and temporary Flyway troubleshooting files.
- Refreshed audit, security, and deployment documentation under `docs/`.

### Verification
- `npm.cmd run build` passed.
- `cmd.exe /c mvnw.cmd -DskipTests package` passed.

## 2026-07-31 - Real storefront UI pass

### Frontend UI
- Reworked the visual system toward a clean monochrome fashion storefront inspired by the supplied reference.
- Made the default storefront light, with black editorial accents, sharper cards, tighter product grids, and a black footer/promo strip.
- Removed purple/glow/orb styling and leftover Vite demo assets.
- Fixed button contrast after the light-theme conversion.

### Hygiene
- Replaced docker-compose secrets with environment placeholders.
- Verified no leaked Razorpay, Cloudinary, or Gmail values remain in the project source.

### Verification
- `npm.cmd run build` passed.
- `cmd.exe /c mvnw.cmd -DskipTests package` passed.
