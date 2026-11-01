import { test } from '@playwright/test';

// Captures README screenshots. Run with: SCREENSHOTS=1 npx playwright test screenshots
test.skip(!process.env.SCREENSHOTS, 'set SCREENSHOTS=1 to refresh docs/ images');

test('capture landing and dashboard screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'docs/landing.png' });
  await page.locator('#try').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.locator('#try').screenshot({ path: 'docs/landing-risk-demo.png' });
  await page.locator('#guardian').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.locator('#guardian').screenshot({ path: 'docs/landing-guardian.png' });

  for (const scenario of [
    'Pay CVS Pharmacy $48',
    'Pay Helen Brooks $650',
    'Pay Officer James $1,900',
  ]) {
    await page.goto('/demo');
    await page.getByRole('button', { name: scenario }).click();
    await page.waitForURL(/result/);
  }
  await page.goto('/guardian');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/dashboard-guardian.png', fullPage: true });
  await page.getByRole('button', { name: /Dark/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/dashboard-guardian-light.png', fullPage: true });
  await page.getByRole('button', { name: /Light/ }).click();
  await page.goto('/audit');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'docs/dashboard-lure-log.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'docs/landing-mobile.png' });
});
