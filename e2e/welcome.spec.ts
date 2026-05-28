import { test, expect } from '@playwright/test';

/** WO-037: Public welcome page loads. */
test('welcome page shows onboarding hub title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Employee Onboarding Hub/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible();
});
