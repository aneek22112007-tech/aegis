import { expect, test } from '@playwright/test';

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

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/demo');
  await page.screenshot({ path: 'docs/demo-start.png', fullPage: true });
  await page.getByRole('button', { name: 'Run CVS Pharmacy $48' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/demo-captured.png', fullPage: true });
  await page.getByRole('button', { name: 'Run Helen Brooks $650' }).click();
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/demo.png', fullPage: true });
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByText('Approved by Priya')).toBeVisible();
  await page.screenshot({ path: 'docs/demo-approved.png', fullPage: true });
  await page.getByRole('button', { name: 'Run Officer James $1,900' }).click();
  await expect(page.getByRole('status')).toContainText('Stopped');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/demo-voided.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/demo-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1024, height: 640 });
  // Hold one more payment so the guardian dashboard has a pending alert.
  await page.getByRole('button', { name: 'Run Helen Brooks $650' }).click();
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
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
