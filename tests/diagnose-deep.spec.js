const { test } = require('@playwright/test');

test.describe('DEEP DIAGNOSIS', () => {
  test('capture everything', async ({ page, request }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    let responseStatus = null;
    let responseText = '';
    page.on('response', async (res) => {
      if (res.url().includes('api/auth/login')) {
        responseStatus = res.status();
        try { responseText = await res.text(); } catch {}
      }
    });

    await page.goto('https://soil-ai-ten.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'demo@farm.ai');
    await page.fill('input[type="password"]', 'demo1234');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    console.log('\n=== Response Status ===');
    console.log('Status:', responseStatus);
    console.log('Body (first 300 chars):', (responseText || 'no response captured').substring(0, 300));

    console.log('\n=== Console Errors ===');
    for (const e of errors) console.log(e);

    // Also test directly via request API
    console.log('\n=== Direct API test ===');
    try {
      const res = await request.post('https://quiet-brussels-acm-discuss.trycloudflare.com/api/auth/login', {
        data: { email: 'demo@farm.ai', password: 'demo1234' },
        headers: { 
          'Content-Type': 'application/json',
          'Origin': 'https://soil-ai-ten.vercel.app',
        },
      });
      console.log('Direct test status:', res.status());
      const headers = res.headers();
      console.log('CORS header:', headers['access-control-allow-origin'] || 'MISSING');
      const body = await res.text();
      console.log('Response body (first 200):', body.substring(0, 200));
    } catch (e) {
      console.log('Direct test FAILED:', e.message);
    }
  });
});
