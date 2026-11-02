import { expect, test } from '@playwright/test';

// Captures README screenshots. Run with: SCREENSHOTS=1 npx playwright test screenshots
test.skip(!process.env.SCREENSHOTS, 'set SCREENSHOTS=1 to refresh docs/ images');

test('capture landing, sandbox, dashboard and senior screenshots', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByTestId('story-motion')).toBeVisible();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'docs/landing.png' });
  await page.screenshot({ path: 'docs/landing-ch1.png' });
  const at = async (y: number, file: string) => {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: file });
  };
  await at(3700, 'docs/landing-ch2.png');
  await at(5000, 'docs/landing-ch3.png');
  const audit = await page.evaluate(
    () => document.getElementById('audit')!.getBoundingClientRect().top + window.scrollY,
  );
  await at(audit + 320, 'docs/landing-ch4.png');

  await page.goto('/demo');
  await page.getByRole('button', { name: 'Run CVS Pharmacy $48' }).click();
  await expect(page.getByRole('status')).toContainText('Sent');
  await page.getByRole('button', { name: 'Run Officer James $1,900' }).click();
  await expect(page.getByRole('status')).toContainText('Stopped');
  await page.getByRole('button', { name: 'Run Helen Brooks $650' }).click();
  await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/demo.png', fullPage: true });

  await page.goto('/guardian');
  await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'docs/dashboard-guardian.png', fullPage: true });

  await page.goto('/audit');
  await expect(page.getByText('Officer James').first()).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/dashboard-lure-log.png', fullPage: true });

  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/senior');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/senior.png', fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/landing-mobile.png' });
});
