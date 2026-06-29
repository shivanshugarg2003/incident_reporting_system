import { test, expect } from '../fixtures';
import {
  criticalSystemDownTicket,
  criticalSecurityDownTicket,
  criticalError500Ticket,
  lowPriorityTicket,
} from '../fixtures/ticket-data';
import { createTicket } from '../utils/api-client';
import { today } from '../utils/date-helper';

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

  test('assigns Critical priority for remaining keyword patterns via API', async ({
    request,
  }) => {
    const cases = [
      {
        reporter_name: 'Server Crash Reporter',
        description: 'Detected a server crash in production overnight',
      },
      {
        reporter_name: 'Data Breach Reporter',
        description: 'Possible data breach identified during audit review',
      },
      {
        reporter_name: 'Outage Reporter',
        description: 'Major network outage impacted customer access today',
      },
      {
        reporter_name: 'Critical Failure Reporter',
        description: 'critical failure in authentication service today',
      },
      {
        reporter_name: 'Unauthorized Access Reporter',
        description: 'unauthorized access detected on admin console today',
      },
      {
        reporter_name: 'Unauthorised Access Reporter',
        description: 'unauthorised access detected on admin console today',
      },
      {
        reporter_name: 'Error500 Reporter',
        description: 'Users reported error500 on checkout repeatedly today',
      },
    ];

    for (const ticketCase of cases) {
      const ticket = await createTicket(request, {
        reporter_name: ticketCase.reporter_name,
        source_type: 'Email',
        incident_date: today(),
        description: ticketCase.description,
      });
      expect(ticket.priority).toBe('Critical');
    }
  });

  test('assigns Critical priority for typos and issue variants via API', async ({
    request,
    dashboardPage,
  }) => {
    const cases = [
      {
        reporter_name: 'Shivanshu',
        description: 'crictical issues in system',
      },
      {
        reporter_name: 'Critical Issues Reporter',
        description: 'critical issues in the system today',
      },
      {
        reporter_name: 'System Critical Reporter',
        description: 'critical system outage reported by monitoring',
      },
      {
        reporter_name: 'Typo System Down Reporter',
        description: 'sytem down in staging environment today',
      },
      {
        reporter_name: 'Typo Security Reporter',
        description: 'securty down on perimeter firewall today',
      },
      {
        reporter_name: 'Http 500 Reporter',
        description: 'http 500 returned from payment service today',
      },
    ];

    for (const ticketCase of cases) {
      const ticket = await createTicket(request, {
        reporter_name: ticketCase.reporter_name,
        source_type: 'Email',
        incident_date: today(),
        description: ticketCase.description,
      });
      expect(ticket.priority).toBe('Critical');
    }

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await expect(
      dashboardPage.priorityBadgeInRow('Shivanshu', 'Critical'),
    ).toBeVisible();
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
