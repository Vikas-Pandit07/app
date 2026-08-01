# Outloox Production Setup Guide

## Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend dev)
- Java 17+ (for backend dev)
- MySQL 8+ (optional if using Docker)

### Option 1: Docker Compose (Recommended)

```bash
cd outloox-production-ready-v9

# Start all services
docker-compose up -d

# Verify services
docker-compose ps
```

**Services available:**

- Frontend: http://localhost:8080
- Backend API: http://localhost:9090
- MySQL: localhost:3306

**Stop services:**

```bash
docker-compose down
```

---

## Option 2: Local Development

### 1. Start MySQL Database

```bash
docker run --name outloox-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=outloox \
  -p 3306:3306 \
  -d mysql:8.4
```

### 2. Start Backend (Spring Boot)

```bash
cd backend

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=outloox
export DB_USERNAME=root
export DB_PASSWORD=root

# Run with Maven
mvn spring-boot:run

# Or build and run JAR
mvn clean package -DskipTests
java -jar target/outloox-backend-*.jar
```

Backend will run on `http://localhost:9090`

**Verify backend is working:**

```bash
curl http://localhost:9090/api/products
```

### 3. Start Frontend (React/Vite)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Database Setup

### Automatic (Flyway)

Database migrations run automatically on backend startup:

- Creates schema (V1\_\_initial_schema.sql)
- Seeds product catalog (V3\_\_legacy_outloox_upgrade.sql)
- Seeds demo data if `APP_SEED_DEMO_CATALOG=true`

### Manual

```bash
# Connect to MySQL
mysql -h localhost -u root -p outloox < database/migrations/README.md

# Check migrations
SELECT * FROM flyway_schema_history;
```

---

## Environment Configuration

### Development (.env)

**Backend** - `backend/.env` or system env vars:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=outloox
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=dev-secret-key-change-in-production
APP_SEED_DEMO_CATALOG=true
SPRING_PROFILES_ACTIVE=dev
```

**Frontend** - `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:9090
VITE_SITE_URL=http://localhost:5173
```

### Production

**Backend** - Use environment variables:

```
SPRING_PROFILES_ACTIVE=prod
DB_HOST=prod-db-host
DB_NAME=outloox_prod
DB_USERNAME=prod_user
DB_PASSWORD=SECURE_RANDOM_PASSWORD
JWT_SECRET=VERY_LONG_RANDOM_SECRET_MIN_32_CHARS
APP_SEED_DEMO_CATALOG=false
APP_COOKIE_SECURE=true
APP_COOKIE_SAME_SITE=None
APP_CORS_ALLOWED_ORIGINS=https://yourdomain.com
RAZORPAY_KEY_ID=your_live_key
RAZORPAY_KEY_SECRET=your_live_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

**Frontend** - Build environment:

```
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SITE_URL=https://yourdomain.com
```

---

## API Integration Status

### ✅ Implemented

- Products API (`GET /api/products`, `GET /api/products/{id}`)
- Categories API
- Authentication API (Login/Register/Profile)
- Address Management API
- Payment API (Razorpay integration)

### ✅ Frontend Connected

- Product listing with backend data fallback
- Product detail page
- Login/Register flows

### ⚠️ Partial/Needs Testing

- Shopping cart (backend ready, frontend needs connection)
- Checkout flow (backend ready, needs frontend integration)
- Order tracking (backend ready, frontend UI exists)

### 🔄 TODO - Frontend Tasks

- [ ] Connect cart add/remove to backend `/api/cart`
- [ ] Connect checkout to backend `/api/orders`
- [ ] Implement order tracking page
- [ ] Add product review submission
- [ ] Add wishlist functionality

---

## Troubleshooting

### Backend won't start

**Error: "Database connection failed"**

```
Solution: Ensure MySQL is running and credentials are correct
docker ps | grep mysql
```

**Error: "Flyway migration failed"**

```
Solution: Check migration SQL syntax in backend/src/main/resources/db/migration/
Check database user has CREATE permission
```

### Frontend shows fallback mock data

**Issue: Products not loading from API**

1. Check backend is running: `curl http://localhost:9090/api/products`
2. Check CORS is enabled (backend logs should show)
3. Check frontend .env has correct `VITE_API_BASE_URL`
4. Open browser DevTools → Network tab → check `/api/products` request

### Razorpay errors

**Production only:**

- Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- Test with Razorpay test keys first
- Webhook must be accessible from Razorpay servers

---

## Production Deployment

### Docker Deployment

```bash
# Build images
docker build -t outloox-backend ./backend
docker build -t outloox-frontend ./frontend

# Push to registry
docker tag outloox-backend your-registry/outloox-backend:1.0
docker push your-registry/outloox-backend:1.0
```

### Kubernetes / Managed Services

See `DEPLOYMENT_GUIDE.md` for:

- K8s manifest templates
- AWS ECS configuration
- Azure Container Instances setup
- Environment variable management

### Critical Pre-Launch Checklist

- [ ] JWT_SECRET is random 32+ chars
- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] CORS_ALLOWED_ORIGINS set to your domain only
- [ ] Rate limiting enabled
- [ ] Email service configured for order notifications
- [ ] Razorpay live keys configured
- [ ] Error tracking (Sentry/similar) configured
- [ ] Database migrations tested on prod schema
- [ ] Smoke tests passed on staging

---

## Next Steps

1. **Run locally** following Option 1 or 2 above
2. **Test the store** - add items, checkout, payment
3. **Fix any integration issues** (see API Integration Status above)
4. **Run production tests** in docker-compose with prod profiles
5. **Deploy to staging** for stakeholder testing
6. **Deploy to production** with monitoring

---

## Support

For issues:

1. Check logs: `docker-compose logs backend`
2. Review `AUDIT_REPORT.md` for known issues
3. Check `SECURITY_REPORT.md` for security settings
