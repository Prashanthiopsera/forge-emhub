import { test, expect } from '@playwright/test';

/** WO-037: Auth flow — login page and protected route redirect. */
test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /Sign in/i })).toBeVisible();
});

test('login page has accessible form fields', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
});
