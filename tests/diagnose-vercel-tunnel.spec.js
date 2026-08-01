const { test, expect } = require('@playwright/test');

test.describe('🔍 DIAGNOSIS — Tunnel Login Failure', () => {
  test('D1 - What URL is Vercel actually calling?', async ({ page }) => {
    const apiCalls = [];
    page.on('request', (req) => {
      if (req.url().includes('api') || req.url().includes('auth')) {
        apiCalls.push({ method: req.method(), url: req.url() });
      }
    });
    page.on('response', (res) => {
      if (res.url().includes('api/auth/login')) {
        console.log(`RESPONSE: ${res.status()} ${res.statusText()}`);
      }
    });

    console.log('\n=== 1. Loading login page ===');
    await page.goto('https://soil-ai-ten.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('\n=== 2. Submitting login ===');
    await page.fill('input[type="email"]', 'demo@farm.ai');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    console.log('\n=== 3. API calls captured ===');
    for (const call of apiCalls) {
      console.log(`${call.method} ${call.url}`);
    }

    console.log('\n=== 4. Current URL ===');
    console.log(page.url());

    console.log('\n=== 5. Token in localStorage ===');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('Token:', token ? `YES (${token.substring(0, 30)}...)` : 'NO');
  });
});
