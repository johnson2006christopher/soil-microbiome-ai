const { test, expect } = require('@playwright/test');

const VERCEL_URL = 'https://soil-ai-ten.vercel.app';

test.describe('🔍 DIAGNOSIS — Vercel Login Failure', () => {
  
  test('D1 - What API URL is the frontend calling?', async ({ page, request }) => {
    const networkLogs = [];
    
    // Capture ALL network requests
    page.on('request', (req) => networkLogs.push({ 
      type: 'request', 
      url: req.url(), 
      method: req.method(),
      headers: req.headers(),
    }));
    page.on('response', (res) => networkLogs.push({ 
      type: 'response', 
      url: res.url(), 
      status: res.status(),
      statusText: res.statusText(),
      headers: res.headers(),
    }));
    
    // Capture console
    const consoleLogs = [];
    page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => consoleLogs.push(`[PAGE ERROR] ${err.message}`));
    
    // Navigate to login
    console.log('\n=== 1. Loading login page ===');
    await page.goto(`${VERCEL_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check what the form looks like
    const emailInput = page.locator('input[type="email"]');
    const passInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');
    
    console.log('Email input visible:', await emailInput.isVisible({ timeout: 5000 }).catch(() => false));
    console.log('Password input visible:', await passInput.isVisible({ timeout: 5000 }).catch(() => false));
    console.log('Submit button visible:', await submitBtn.isVisible({ timeout: 5000 }).catch(() => false));
    
    // Fill and submit
    console.log('\n=== 2. Attempting login ===');
    await emailInput.fill('demo@farm.ai');
    await passInput.fill('demo1234');
    
    // Clear network logs before submit
    networkLogs.length = 0;
    
    await submitBtn.click();
    
    // Wait for API call
    await page.waitForTimeout(5000);
    
    // Find the API call
    const apiReqs = networkLogs.filter(l => l.url.includes('/api/auth/login') || l.url.includes('/login'));
    console.log('\n=== 3. API requests captured ===');
    for (const log of apiReqs) {
      console.log(`${log.type.toUpperCase()}: ${log.method || ''} ${log.url} → ${log.status || ''}`);
      if (log.status) {
        console.log(`  Response headers:`, JSON.stringify(log.headers).substring(0, 300));
      }
    }
    
    // Check localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    console.log('\n=== 4. Auth state ===');
    console.log('Token in localStorage:', token ? 'YES' : 'NO');
    console.log('User in localStorage:', user ? 'YES' : 'NO');
    
    // Current URL
    console.log('\n=== 5. Current page ===');
    console.log('URL:', page.url());
    
    // Console errors
    console.log('\n=== 6. Console logs ===');
    for (const log of consoleLogs) {
      console.log(log);
    }

    // Also test backend directly
    console.log('\n=== 7. Direct backend test ===');
    try {
      const res = await request.get('https://soil-api.onrender.com/health', {}, { timeout: 10000 });
      console.log('Render health status:', res.status());
      console.log('Render health body:', await res.text().then(t => t.substring(0, 200)));
    } catch (e) {
      console.log('Render health FAILED:', e.message.substring(0, 100));
    }

    try {
      const res = await request.post('https://soil-api.onrender.com/api/auth/login', {
        data: { email: 'demo@farm.ai', password: 'demo1234' },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log('Render login status:', res.status());
      console.log('Render login body:', await res.text().then(t => t.substring(0, 200)));
    } catch (e) {
      console.log('Render login FAILED:', e.message.substring(0, 100));
    }

    // Check VITE_API_URL baked value
    console.log('\n=== 8. VITE_API_URL in build ===');
    const apiUrl = await page.evaluate(() => {
      // Try to find the API base URL from the page context
      return window.__VITE_API_URL__ || 'not accessible';
    });
    console.log('VITE_API_URL:', apiUrl);

    // Check actual axios base URL  
    const axiosBase = await page.evaluate(() => {
      // Try to find axios config on window
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        if (s.src && s.src.includes('main') && s.textContent) {
          const match = s.textContent.match(/soil-api\.onrender\.com|localhost:5000|baseURL/);
          if (match) return match[0];
        }
      }
      return 'not found in inline scripts';
    });
    console.log('Axios baseURL in bundle:', axiosBase);

    // Also check environment variable from Vite
    console.log('\n=== 9. Checking network call to verify actual API endpoint ===');
    const allApiCalls = networkLogs.filter(l => 
      l.type === 'request' && 
      (l.url.includes('api') || l.url.includes('onrender') || l.url.includes('5000') || l.url.includes('localhost'))
    );
    for (const log of allApiCalls) {
      console.log(`REQUEST: ${log.method} ${log.url}`);
    }
  });
});
