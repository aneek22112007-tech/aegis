import { expect, test } from '@playwright/test';

test('home screen names AEGIS', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /payments that follow your rules/i }),
  ).toBeVisible();
  await expect(page.getByText(/PayPal app are not seen by AEGIS/)).toBeVisible();
});
