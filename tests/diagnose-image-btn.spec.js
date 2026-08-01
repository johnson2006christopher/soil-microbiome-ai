const { test, expect } = require('@playwright/test');

const DEMO_EMAIL = 'demo@farm.ai';
const DEMO_PASSWORD = 'demo1234';

test('Diagnose — Image Analysis button state', async ({ page }) => {
  // Login
  await page.goto('https://soil-ai-ten.vercel.app/login');
  await page.fill('input[type="email"]', DEMO_EMAIL);
  await page.fill('input[type="password"]', DEMO_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  
  // Navigate to Image Analysis
  await page.goto('https://soil-ai-ten.vercel.app/dashboard/image-analysis');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Check the Analyze button state before upload
  const analyzeBtn = page.locator('button:has-text("Analyze Image")');
  console.log('1. Button visible (before upload):', await analyzeBtn.isVisible().catch(() => false));
  console.log('2. Button disabled (before upload):', await analyzeBtn.isDisabled().catch(() => 'error'));
  
  // Click the dataset type selector
  console.log('3. Clicking tomato dataset type...');
  await page.click('button:has-text("tomato"):not(:has-text("TOMATO"))');
  
  // Try to upload a file via the file input
  const fileInput = page.locator('input[type="file"]');
  console.log('4. File input exists:', await fileInput.count());
  
  if (await fileInput.count() > 0) {
    // Upload a simple test image
    await fileInput.setInputFiles('/tmp/test_image.jpg');
    await page.waitForTimeout(1000);
    
    console.log('5. After upload — button visible:', await analyzeBtn.isVisible().catch(() => false));
    console.log('6. After upload — button disabled:', await analyzeBtn.isDisabled().catch(() => 'error'));
    console.log('7. Button classes:', await analyzeBtn.getAttribute('class'));
    console.log('8. Button text:', await analyzeBtn.textContent());
    
    // Check if the file name is displayed
    const fileInfo = page.locator('text=/KB/');
    console.log('9. File size info visible:', await fileInfo.isVisible().catch(() => false));
  }

  // Check for console errors
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  
  // Check farm context
  const farmValid = await page.evaluate(() => {
    const select = document.querySelector('select');
    return select ? select.value : null;
  });
  console.log('10. Active farm selected:', farmValid);
});
