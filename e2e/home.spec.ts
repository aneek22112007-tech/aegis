import { expect, test } from '@playwright/test';

test('landing page introduces AEGIS and links to the demo', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { level: 1, name: /enforced before money moves/i }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Read the FTC report' })).toBeVisible();
  await page.locator('#checker').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('risk-result')).toContainText('Voided before capture');
  await page.getByRole('link', { name: 'Run the live demo' }).click();
  await expect(page).toHaveURL(/\/demo$/);
});

test('senior home still names AEGIS', async ({ page }) => {
  await page.goto('/senior');
  await expect(
    page.getByRole('heading', { name: /payments that follow your rules/i }),
  ).toBeVisible();
  await expect(page.getByText(/PayPal app are not seen by AEGIS/)).toBeVisible();
});
