import { test, expect } from '../fixtures';

test.describe('Navigation', () => {
  test('root path redirects to submit page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/submit$/);
    await expect(
      page.getByRole('heading', { name: 'Report an Incident' }),
    ).toBeVisible();
  });

  test('navbar links navigate between submit and dashboard', async ({
    page,
    navbar,
    submitPage,
    dashboardPage,
  }) => {
    await submitPage.goto();
    await expect(submitPage.pageTitle).toBeVisible();

    await navbar.goToDashboard();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboardPage.pageTitle).toBeVisible();

    await navbar.goToSubmit();
    await expect(page).toHaveURL(/\/submit$/);
    await expect(submitPage.pageTitle).toBeVisible();
  });

  test('active navbar link is highlighted on submit page', async ({
    submitPage,
    navbar,
  }) => {
    await submitPage.goto();
    await expect(navbar.submitIncidentLink).toHaveClass(/text-blue-600/);
    await expect(navbar.dashboardLink).not.toHaveClass(/text-blue-600/);
  });
});
