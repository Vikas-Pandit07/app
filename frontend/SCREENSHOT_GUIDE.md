# OUTLOOX Exact Browser Screenshot Guide

This guide helps you capture **exact browser screenshots from your running app**.

## 1) Start backend
Open terminal in `backend`:

```bash
./mvnw spring-boot:run
```

For Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Make sure backend runs on:
- `http://localhost:9090`

## 2) Start frontend
Open terminal in `frontend`:

```bash
npm install
npm run dev
```

Make sure frontend runs on:
- `http://127.0.0.1:5173`
  or
- `http://localhost:5173`

## 3) Install Playwright browser once
Inside `frontend`:

```bash
npx playwright install chromium
```

## 4) Optional: prepare better screenshots
If you want logged-in/profile/order screenshots:
- create a test user
- login once manually if needed
- add at least one address
- add products to cart
- place at least one order

You can also pass login credentials directly to the screenshot script.

## 5) Run screenshot capture
Inside `frontend`:

### Public pages only
```bash
npm run screenshots:exact
```

### With login for profile / checkout / order pages

PowerShell:
```powershell
$env:SCREENSHOT_BASE_URL="http://127.0.0.1:5173"
$env:SCREENSHOT_USERNAME="your_username_or_email"
$env:SCREENSHOT_PASSWORD="your_password"
$env:SCREENSHOT_ORDER_ID="1201"
npm run screenshots:exact
```

CMD:
```cmd
set SCREENSHOT_BASE_URL=http://127.0.0.1:5173
set SCREENSHOT_USERNAME=your_username_or_email
set SCREENSHOT_PASSWORD=your_password
set SCREENSHOT_ORDER_ID=1201
npm run screenshots:exact
```

## 6) Output location
Screenshots are saved in:

```text
frontend/exact-screenshots/<timestamp>/
```

Files generated typically include:
- `home.png`
- `shop.png`
- `product-detail.png`
- `cart.png`
- `about.png`
- `profile.png` (if login succeeds)
- `checkout.png` (if login succeeds)
- `order-detail.png` (if order id provided)
- `index.html` gallery

## 7) Open the gallery
Open:

```text
exact-screenshots/<timestamp>/index.html
```

That gives you a visual gallery of the exact captured screens.
