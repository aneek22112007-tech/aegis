import { expect, test } from '@playwright/test';

const sandbox = (page: import('@playwright/test').Page) =>
  expect(page.getByRole('button', { name: 'Run CVS Pharmacy $48' })).toBeVisible();

test('sandbox renders over legacy and broken demo data', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem('aegis-demo-state-v1', JSON.stringify({ payments: null, payees: 3 }));
    localStorage.setItem('aegis-demo-state', '{broken');
  });
  await page.goto('/demo');
  await sandbox(page);
  expect(errors).toEqual([]);
});

test('Back and Forward keep the sandbox rendered', async ({ page }) => {
  await page.goto('/');
  await page.goto('/demo');
  await sandbox(page);
  await page.goto('/senior');
  await page.goBack();
  await sandbox(page);
  await page.goBack();
  await page.goForward();
  await sandbox(page);
  const style = await page.evaluate(() => ({
    opacity: getComputedStyle(document.body).opacity,
    overflow: getComputedStyle(document.documentElement).overflow,
  }));
  expect(style).toEqual({ opacity: '1', overflow: 'visible' });
});

test('a missing lazy chunk shows the recovery card, not a blank page', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => sessionStorage.setItem('aegis-chunk-reload', String(Date.now())));
  await page.route(/DemoPage/, (r) => r.fulfill({ status: 404, body: '' }));
  await page.getByRole('link', { name: 'Open sandbox' }).first().click();
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo data' })).toBeVisible();
});
