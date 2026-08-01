const { test, expect } = require('@playwright/test');

test.describe('🔍 FINAL DIAGNOSIS', () => {
  test('D1 - Check Vercel API URL after rebuild', async ({ page }) => {
    const apiCalls = [];
    page.on('request', (req) => {
      if (req.url().includes('api/auth/login')) {
        apiCalls.push({ method: req.method(), url: req.url() });
      }
    });

    console.log('\n=== Loading login page ===');
    await page.goto('https://soil-ai-ten.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('\n=== Submitting login ===');
    await page.fill('input[type="email"]', 'demo@farm.ai');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    console.log('\n=== API URL being called ===');
    for (const call of apiCalls) {
      console.log(`${call.method} ${call.url}`);
    }

    const url = apiCalls[0]?.url || '';
    if (url.includes('trycloudflare.com')) {
      console.log('\n✅ SUCCESS — calling the tunnel URL!');
    } else if (url.includes('onrender.com')) {
      console.log('\n❌ STILL calling old Render URL — Vercel may not have rebuilt yet');
    } else {
      console.log('\n⚠️ Unexpected URL:', url);
    }

    const token = await page.evaluate(() => localStorage.getItem('token'));
    console.log('\nToken stored:', token ? 'YES' : 'NO');
    console.log('Current URL:', page.url());
  });
});
