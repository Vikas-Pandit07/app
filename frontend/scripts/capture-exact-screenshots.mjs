import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:5173';
const username = process.env.SCREENSHOT_USERNAME || '';
const password = process.env.SCREENSHOT_PASSWORD || '';
const orderId = process.env.SCREENSHOT_ORDER_ID || '';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = path.resolve('exact-screenshots', timestamp);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture(page, name, route) {
  console.log(`Capturing ${name}: ${route}`);
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await delay(1200);
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: true,
  });
}

async function addCartItemFromProduct(page) {
  await page.goto(`${baseUrl}/product/oversized-black-tee`, { waitUntil: 'networkidle' });
  await delay(1200);
  const addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
  if (await addToCartButton.isVisible().catch(() => false)) {
    await addToCartButton.click();
    await delay(1200);
  }
}

async function loginIfCredentialsProvided(page) {
  if (!username || !password) {
    console.log('Skipping login screenshots because SCREENSHOT_USERNAME / SCREENSHOT_PASSWORD were not provided.');
    return false;
  }

  console.log('Logging in with provided credentials...');
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel(/username or email/i).fill(username);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForLoadState('networkidle');
  await delay(1500);

  const currentUrl = page.url();
  const loginSucceeded = !currentUrl.includes('/login');
  console.log(loginSucceeded ? 'Login successful.' : 'Login may have failed.');
  return loginSucceeded;
}

async function writeIndex(captured) {
  const cards = captured
    .map(
      ({ name, title, note }) => `
      <div class="card">
        <img src="./${name}.png" alt="${title}" />
        <div class="meta">
          <h2>${title}</h2>
          <p>${note}</p>
        </div>
      </div>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OUTLOOX Exact App Screenshots</title>
  <style>
    body{margin:0;background:#0c0c0c;color:#fff;font-family:Inter,Arial,sans-serif}
    .wrap{max-width:1300px;margin:0 auto;padding:32px 20px 48px}
    h1{margin:0 0 8px;font-size:38px;text-transform:uppercase;letter-spacing:.06em}
    .lead{color:rgba(255,255,255,.72);margin:0 0 24px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px}
    .card{background:#141210;border:1px solid rgba(255,255,255,.08);border-radius:18px;overflow:hidden}
    .card img{display:block;width:100%;height:auto}
    .meta{padding:14px 16px 18px}
    .meta h2{margin:0 0 8px;font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:#c4b5fd}
    .meta p{margin:0;color:rgba(255,255,255,.66);font-size:14px;line-height:1.5}
    .tip{background:rgba(124,58,237,.14);border:1px solid rgba(124,58,237,.35);padding:14px 16px;border-radius:12px;margin:0 0 28px}
    code{background:#1f1f1f;padding:2px 6px;border-radius:6px}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>OUTLOOX Exact App Screenshots</h1>
    <p class="lead">These screenshots were captured from your running app at <code>${baseUrl}</code>.</p>
    <div class="tip">If login/order screenshots are missing, rerun the script with <code>SCREENSHOT_USERNAME</code>, <code>SCREENSHOT_PASSWORD</code>, and optionally <code>SCREENSHOT_ORDER_ID</code>.</div>
    <div class="grid">${cards}</div>
  </div>
</body>
</html>`;

  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
}

async function main() {
  await ensureDir(outputDir);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  const captured = [];

  await capture(page, 'home', '/');
  captured.push({ name: 'home', title: 'Home', note: 'Hero, collections, and best sellers from the running app.' });

  await capture(page, 'shop', '/shop');
  captured.push({ name: 'shop', title: 'Shop', note: 'Catalog, filters, and product listing.' });

  await capture(page, 'product-detail', '/product/oversized-black-tee');
  captured.push({ name: 'product-detail', title: 'Product Detail', note: 'Gallery, pricing, size/color selection, and CTA buttons.' });

  await addCartItemFromProduct(page);
  await capture(page, 'cart', '/cart');
  captured.push({ name: 'cart', title: 'Cart', note: 'Actual cart page after adding an item through the app.' });

  await capture(page, 'about', '/about');
  captured.push({ name: 'about', title: 'About', note: 'Brand story and values page.' });

  const loggedIn = await loginIfCredentialsProvided(page);
  if (loggedIn) {
    await capture(page, 'profile', '/profile');
    captured.push({ name: 'profile', title: 'Profile', note: 'Live profile, order history, and address management.' });

    await capture(page, 'checkout', '/checkout');
    captured.push({ name: 'checkout', title: 'Checkout', note: 'Live checkout page from the running app.' });

    if (orderId) {
      await capture(page, 'order-detail', `/orders/${orderId}`);
      captured.push({ name: 'order-detail', title: 'Order Detail', note: `Live order detail for order #${orderId}.` });
    }
  }

  await writeIndex(captured);
  await browser.close();

  console.log(`\nDone. Screenshots saved in:\n${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
