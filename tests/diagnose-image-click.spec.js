const { test } = require('@playwright/test');

test('Click Analyze button after upload', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  // Login
  await page.goto('https://soil-ai-ten.vercel.app/login');
  await page.fill('input[type="email"]', 'demo@farm.ai');
  await page.fill('input[type="password"]', 'demo1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  
  await page.goto('https://soil-ai-ten.vercel.app/dashboard/image-analysis');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Upload file
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles('/tmp/test_image.jpg');
  await page.waitForTimeout(2000);

  // Click Analyze button
  const analyzeBtn = page.locator('button:has-text("Analyze Image")');
  console.log('Button disabled:', await analyzeBtn.isDisabled());
  console.log('Button text:', await analyzeBtn.textContent());
  
  await analyzeBtn.click();
  console.log('Clicked!');
  
  // Wait for result or error
  await page.waitForTimeout(5000);
  
  // Check what happened
  const resultSection = page.locator('text=/Analysis complete|Internal Server|failed|error/i').first();
  const resultText = await resultSection.textContent().catch(() => 'not found');
  console.log('Result/Error:', resultText);
  
  // Check loading steps
  const loadingText = await page.locator('text=/Running|Uploading|Preprocessing/i').first().textContent().catch(() => 'none');
  console.log('Loading text:', loadingText);
  
  // Console errors
  console.log('\nConsole errors:');
  for (const e of errors) console.log(' ', e);
});
