import { test, expect } from '@playwright/test';

// /pricing against the subscription catalogue (Minty/docs/schema/seed_catalogue.sql): the plan
// names, and every amount written the house way - "HKD 280", the code and a NON-BREAKING space,
// never a symbol and never a plain space that lets the code wrap away from its number.

test('the plans carry the catalogue names and prices', async ({ page }) => {
  await page.goto('/pricing');
  for (const name of ['Petty Cash', 'Payment Request', 'Super Minty']) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
  }
  const text = await page.locator('main').innerText();
  expect(text).toContain('HKD\u00a0280/mo');
  expect(text).toContain('HKD\u00a0400/mo');
  expect(text).toContain('HKD\u00a0120');
});

test('no amount on the site uses a symbol or a breaking space', async ({ page }) => {
  for (const path of ['/', '/pricing', '/resources/faq', '/resources/learning']) {
    await page.goto(path);
    const text = await page.locator('body').innerText();
    expect(text, `${path}: HKD followed by a plain space`).not.toMatch(/HKD [0-9]/);
    expect(text, `${path}: a dollar sign before a number`).not.toMatch(/(HK)?\$[0-9]/);
  }
});
