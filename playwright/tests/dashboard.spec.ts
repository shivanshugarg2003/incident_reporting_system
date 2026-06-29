import { test, expect } from '../fixtures';
import { createTicket, getTickets } from '../utils/api-client';
import { resetTickets } from '../utils/ticket-store';
import { today, yesterday } from '../utils/date-helper';
import { lowPriorityTicket } from '../fixtures/ticket-data';

test.describe('Ticket Dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  test('shows loading spinner on initial load', async ({
    page,
    dashboardPage,
  }) => {
    await page.route('**/tickets', async (route) => {
      if (route.request().method() === 'GET') {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      await route.continue();
    });

    await dashboardPage.goto();
    await expect(dashboardPage.loadingSpinner).toBeVisible();
    await expect(dashboardPage.emptyState).toBeVisible();
  });

  test('displays submitted ticket with correct details', async ({
    submitPage,
    dashboardPage,
  }) => {
    await submitPage.goto();
    await submitPage.fillForm(lowPriorityTicket);
    await submitPage.submit();
    await expect(submitPage.successBanner).toBeVisible();

    await dashboardPage.goto();
    await dashboardPage.waitForTable();

    const row = dashboardPage.rowByReporterName(lowPriorityTicket.reporterName);
    await expect(row).toContainText(lowPriorityTicket.sourceType);
    await expect(row).toContainText(lowPriorityTicket.incidentDate);
    await expect(row).toContainText(lowPriorityTicket.description);
  });

  test('shows Critical priority badge with red styling', async ({
    request,
    dashboardPage,
  }) => {
    await createTicket(request, {
      reporter_name: 'Critical Reporter',
      source_type: 'Email',
      incident_date: today(),
      description: 'The system down caused a full outage today',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();

    const badge = dashboardPage.priorityBadgeInRow(
      'Critical Reporter',
      'Critical',
    );
    await expect(badge).toBeVisible();
    await expect(badge).toHaveClass(/bg-red-100/);
    await expect(badge).toHaveClass(/text-red-800/);
  });

  test('shows Low priority badge with gray styling', async ({
    request,
    dashboardPage,
  }) => {
    await createTicket(request, {
      reporter_name: 'Low Reporter',
      source_type: 'Portal',
      incident_date: today(),
      description: 'Minor cosmetic issue on the dashboard page',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();

    const badge = dashboardPage.priorityBadgeInRow('Low Reporter', 'Low');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveClass(/bg-gray-100/);
    await expect(badge).toHaveClass(/text-gray-700/);
  });

  test('applies red row background for Critical tickets', async ({
    request,
    dashboardPage,
  }) => {
    await createTicket(request, {
      reporter_name: 'Row Style Critical',
      source_type: 'Email',
      incident_date: today(),
      description: 'security down on perimeter systems today',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();

    const row = dashboardPage.rowByReporterName('Row Style Critical');
    await expect(row).toHaveClass(/bg-red-50/);
  });

  test('sorts tickets by incident date with newest first', async ({
    request,
    dashboardPage,
  }) => {
    await resetTickets();

    await createTicket(request, {
      reporter_name: 'Older Ticket',
      source_type: 'Email',
      incident_date: yesterday(),
      description: 'Older incident logged for sorting verification',
    });

    await createTicket(request, {
      reporter_name: 'Newer Ticket',
      source_type: 'Portal',
      incident_date: today(),
      description: 'Newer incident logged for sorting verification',
    });

    const { tickets } = await getTickets(request);
    expect(tickets).toHaveLength(2);
    expect(tickets[0].reporter_name).toBe('Newer Ticket');
    expect(tickets[1].reporter_name).toBe('Older Ticket');

    await dashboardPage.goto();
    await dashboardPage.waitForTable();

    await expect(dashboardPage.firstDataRow()).toContainText('Newer Ticket');
    await expect(dashboardPage.rowByReporterName('Older Ticket')).toBeVisible();
  });

  test('filters to show only Critical tickets', async ({
    request,
    dashboardPage,
  }) => {
    await resetTickets();

    await createTicket(request, {
      reporter_name: 'Filter Critical',
      source_type: 'Email',
      incident_date: today(),
      description: 'error 500 on payment gateway for all users',
    });

    await createTicket(request, {
      reporter_name: 'Filter Low',
      source_type: 'Portal',
      incident_date: today(),
      description: 'Minor label alignment issue on submit form',
    });

    const { tickets } = await getTickets(request);
    expect(tickets).toHaveLength(2);

    const criticalCount = tickets.filter(
      (ticket) => ticket.priority === 'Critical',
    ).length;

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await dashboardPage.selectFilter('Critical');

    await expect(dashboardPage.rowByReporterName('Filter Critical')).toBeVisible();
    await expect(dashboardPage.rowsByReporterName('Filter Low')).toHaveCount(0);
    await expect(
      dashboardPage.ticketCountLine(criticalCount, tickets.length),
    ).toBeVisible();
  });

  test('filters to show only Low tickets', async ({
    request,
    dashboardPage,
  }) => {
    await resetTickets();

    await createTicket(request, {
      reporter_name: 'Another Critical',
      source_type: 'Email',
      incident_date: today(),
      description: 'system down in staging environment today',
    });

    await createTicket(request, {
      reporter_name: 'Another Low',
      source_type: 'PDF Upload',
      incident_date: today(),
      description: 'Spelling mistake found in footer text area',
    });

    const { tickets } = await getTickets(request);
    expect(tickets).toHaveLength(2);

    const lowCount = tickets.filter((ticket) => ticket.priority === 'Low').length;

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await dashboardPage.selectFilter('Low');

    await expect(dashboardPage.rowByReporterName('Another Low')).toBeVisible();
    await expect(
      dashboardPage.rowsByReporterName('Another Critical'),
    ).toHaveCount(0);
    await expect(
      dashboardPage.ticketCountLine(lowCount, tickets.length),
    ).toBeVisible();
  });

  test('shows empty state when no tickets exist', async ({
    request,
    dashboardPage,
  }) => {
    await resetTickets();
    const { tickets } = await getTickets(request);
    expect(tickets).toHaveLength(0);

    await dashboardPage.goto();
    await dashboardPage.waitForLoaded();
    await expect(dashboardPage.emptyState).toBeVisible();
    await expect(dashboardPage.ticketTable).toHaveCount(0);
  });

  test('shows correct ticket count line', async ({ request, dashboardPage }) => {
    await resetTickets();

    await createTicket(request, {
      reporter_name: 'Count One',
      source_type: 'Email',
      incident_date: today(),
      description: 'First ticket for count line verification test',
    });

    await createTicket(request, {
      reporter_name: 'Count Two',
      source_type: 'Portal',
      incident_date: today(),
      description: 'Second ticket for count line verification test',
    });

    const { tickets } = await getTickets(request);
    expect(tickets).toHaveLength(2);

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await expect(
      dashboardPage.ticketCountLine(tickets.length, tickets.length),
    ).toBeVisible();
  });
});
