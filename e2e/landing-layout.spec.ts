import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [1280, 800],
  [1440, 900],
  [1920, 1080],
]) {
  test(`story callouts stay clear of the phone at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await expect(page.getByTestId('story-motion')).toBeVisible();
    const top = await page.evaluate(
      () => document.getElementById('story')!.getBoundingClientRect().top + window.scrollY,
    );
    const pin = await page.evaluate(
      () => document.querySelector('.pin-spacer')!.getBoundingClientRect().height,
    );
    await page.evaluate((y) => window.scrollTo(0, y), top + 0.62 * (pin - height));
    await expect(page.locator('.callout-check')).toBeVisible();
    const issues = await page.evaluate(() => {
      const phone = document.querySelector('.story-phone')!.getBoundingClientRect();
      return [...document.querySelectorAll('#story .callout-body')].flatMap((el) => {
        const b = el.getBoundingClientRect();
        const hit = !(
          b.right < phone.left ||
          b.left > phone.right ||
          b.bottom < phone.top ||
          b.top > phone.bottom
        );
        const off =
          b.left < 0 || b.right > window.innerWidth || b.top < 0 || b.bottom > window.innerHeight;
        return hit || off ? [`${el.textContent}: ${hit ? 'under phone' : 'off-screen'}`] : [];
      });
    });
    expect(issues).toEqual([]);
  });
}
