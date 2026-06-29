import { test, expect } from '../fixtures';

async function resetTheme(page: import('@playwright/test').Page) {
  await page.goto('/submit');
  await page.evaluate(() => localStorage.removeItem('irs-theme'));
  await page.reload();
}

test.describe('Theme Toggle', () => {
  test('switches to dark theme when toggled on submit page', async ({
    page,
    submitPage,
    navbar,
  }) => {
    await resetTheme(page);
    await submitPage.goto();

    await navbar.toggleTheme();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.getByTestId('app-shell')).toHaveClass(/dark:bg-slate-900/);
    await expect(page.getByTestId('incident-form-card')).toHaveClass(
      /dark:bg-slate-800/,
    );
  });

  test('switches back to light theme', async ({ page, submitPage, navbar }) => {
    await resetTheme(page);
    await submitPage.goto();

    await navbar.toggleTheme();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await navbar.toggleTheme();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    const stored = await page.evaluate(() => localStorage.getItem('irs-theme'));
    expect(stored).toBe('light');
  });

  test('persists theme in localStorage after refresh', async ({
    page,
    submitPage,
    navbar,
  }) => {
    await resetTheme(page);
    await submitPage.goto();

    await navbar.toggleTheme();
    await expect(page.locator('html')).toHaveClass(/dark/);

    const stored = await page.evaluate(() => localStorage.getItem('irs-theme'));
    expect(stored).toBe('dark');

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('updates toggle aria-label for light and dark modes', async ({
    page,
    submitPage,
    navbar,
  }) => {
    await resetTheme(page);
    await submitPage.goto();

    await expect(navbar.themeToggle).toHaveAttribute(
      'aria-label',
      'Switch to dark theme',
    );
    await navbar.toggleTheme();
    await expect(navbar.themeToggle).toHaveAttribute(
      'aria-label',
      'Switch to light theme',
    );
  });

  test('applies dark theme on dashboard page', async ({
    page,
    dashboardPage,
    navbar,
  }) => {
    await resetTheme(page);
    await dashboardPage.goto();

    await navbar.toggleTheme();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.getByTestId('dashboard-card')).toHaveClass(
      /dark:bg-slate-800/,
    );
  });
});
