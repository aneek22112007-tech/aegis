import { expect, test } from '@playwright/test';

test('landing page introduces AEGIS and links to the demo', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: /enforced before money moves/i }),
  ).toBeVisible();
  await expect(page.getByTestId('story-motion')).toBeVisible();
  await page.getByRole('link', { name: 'Read the FTC report' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: 'Read the FTC report' })).toBeVisible();
  await page.locator('#checker').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('risk-result')).toContainText('Voided before capture');
  // the hero copy hands over to later chapters while scrolling, so return to the top first
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole('link', { name: 'Run the live demo' })).toBeVisible();
  await page.getByRole('link', { name: 'Run the live demo' }).click();
  await expect(page).toHaveURL(/\/demo$/);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('landing stacks every chapter with no scroll pinning or WebGL', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('story-static')).toBeVisible();
    await expect(page.getByTestId('story-motion')).toHaveCount(0);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /voided before capture/i })).toBeAttached();
    await page.getByRole('link', { name: 'Run the live demo' }).click();
    await expect(page).toHaveURL(/\/demo$/);
  });
});

test('senior home still names AEGIS', async ({ page }) => {
  await page.goto('/senior');
  await expect(
    page.getByRole('heading', { name: /payments that follow your rules/i }),
  ).toBeVisible();
  await expect(page.getByText(/PayPal app are not seen by AEGIS/)).toBeVisible();
});
