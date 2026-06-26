import { test, expect } from '../fixtures';
import {
  criticalSystemDownTicket,
  criticalSecurityDownTicket,
  criticalError500Ticket,
  lowPriorityTicket,
} from '../fixtures/ticket-data';

test.describe('Rule Engine — Priority Assignment', () => {
  test.beforeEach(async ({ submitPage }) => {
    await submitPage.goto();
  });

  test('assigns Critical priority when description contains "system down"', async ({
    submitPage,
    dashboardPage,
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/tickets') &&
        response.request().method() === 'POST',
    );

    await submitPage.fillForm(criticalSystemDownTicket);
    await submitPage.submit();

    const response = await responsePromise;
    const body = await response.json();
    expect(body.priority).toBe('Critical');

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await expect(
      dashboardPage.priorityBadgeInRow('Critical User', 'Critical'),
    ).toBeVisible();
  });

  test('assigns Critical priority when description contains "security down"', async ({
    submitPage,
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/tickets') &&
        response.request().method() === 'POST',
    );

    await submitPage.fillForm(criticalSecurityDownTicket);
    await submitPage.submit();

    const response = await responsePromise;
    const body = await response.json();
    expect(body.priority).toBe('Critical');
  });

  test('assigns Critical priority when description contains "error 500"', async ({
    submitPage,
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/tickets') &&
        response.request().method() === 'POST',
    );

    await submitPage.fillForm(criticalError500Ticket);
    await submitPage.submit();

    const response = await responsePromise;
    const body = await response.json();
    expect(body.priority).toBe('Critical');
  });

  test('assigns Low priority for normal descriptions', async ({
    submitPage,
    page,
    dashboardPage,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/tickets') &&
        response.request().method() === 'POST',
    );

    await submitPage.fillForm({
      ...lowPriorityTicket,
      reporterName: 'Low Priority Reporter',
    });
    await submitPage.submit();

    const response = await responsePromise;
    const body = await response.json();
    expect(body.priority).toBe('Low');

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await expect(
      dashboardPage.priorityBadgeInRow('Low Priority Reporter', 'Low'),
    ).toBeVisible();
  });
});
