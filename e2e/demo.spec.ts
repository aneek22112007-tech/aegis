import { readFile } from 'node:fs/promises';
import { expect, type Page, test } from '@playwright/test';

async function downloadText(page: Page, name: string): Promise<string> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name }).click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error('Download was not saved');
  return readFile(path, 'utf8');
}

test('pharmacy refill is sent and listed in the Lure Log', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Pay CVS Pharmacy $48' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Sent. $48.00 is on its way to CVS Pharmacy.',
  );
  await page.goto('/audit');
  await expect(page.getByText('CVS Pharmacy').first()).toBeVisible();
  const csv = await downloadText(page, 'Download CSV');
  expect(csv).toContain('when,payee,amount,score,level,decision,status,note');
  expect(csv).toContain('CVS Pharmacy');
});

test('a new payee waits until the guardian approves', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Pay Helen Brooks $650' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Waiting');
  await page.goto('/guardian');
  await expect(page.getByRole('heading', { name: /Helen Brooks/ })).toBeVisible();
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByRole('status')).toContainText('on its way to Helen Brooks');
});

test('the bail message is stopped, blocked, and drafted as a report', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Pay Officer James $1,900' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Stopped');
  await page.goto('/audit');
  await page.getByText('Officer James', { exact: true }).first().click();
  await expect(page.getByRole('heading', { name: /Officer James/ })).toBeVisible();
  const report = await downloadText(page, 'Download report');
  expect(report).toContain('Officer James');
  expect(report).toContain('$1,900.00');
  expect(report).toContain('VOIDED');
  expect(report).toContain('https://reportfraud.ftc.gov');
  const csv = await downloadText(page, 'Download CSV');
  expect(csv).toContain('Officer James');
});
