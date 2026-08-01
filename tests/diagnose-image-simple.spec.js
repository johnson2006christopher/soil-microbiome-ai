const { test } = require('@playwright/test');

const DEMO_EMAIL = 'demo@farm.ai';
const DEMO_PASSWORD = 'demo1234';

test('Image Analysis — file upload and button state', async ({ page }) => {
  // Login
  await page.goto('https://soil-ai-ten.vercel.app/login');
  await page.fill('input[type="email"]', DEMO_EMAIL);
  await page.fill('input[type="password"]', DEMO_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  
  await page.goto('https://soil-ai-ten.vercel.app/dashboard/image-analysis');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Find ALL buttons on the page
  const allBtns = page.locator('button');
  const count = await allBtns.count();
  console.log('Total buttons on page:', count);
  for (let i = 0; i < count; i++) {
    const text = await allBtns.nth(i).textContent();
    const disabled = await allBtns.nth(i).isDisabled().catch(() => '?');
    console.log(`  [${i}] "${text?.trim().substring(0, 60)}" disabled=${disabled}`);
  }
  
  // Try to find the file input and upload
  const fileInput = page.locator('input[type="file"]').first();
  console.log('\nFile input count:', await fileInput.count());
  
  // Check farm context
  const farmInLocalStorage = await page.evaluate(() => localStorage.getItem('activeFarmId'));
  console.log('activeFarmId in localStorage:', farmInLocalStorage ? 'YES' : 'NO');
  
  // Upload test image
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles('/tmp/test_image.jpg');
    await page.waitForTimeout(2000);
    
    console.log('\n=== After upload ===');
    for (let i = 0; i < count; i++) {
      const text = await allBtns.nth(i).textContent();
      const disabled = await allBtns.nth(i).isDisabled().catch(() => '?');
      console.log(`  [${i}] "${text?.trim().substring(0, 60)}" disabled=${disabled}`);
    }
  }
});
