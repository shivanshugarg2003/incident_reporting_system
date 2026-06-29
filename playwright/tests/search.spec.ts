import { test, expect } from '../fixtures';
import { createTicket } from '../utils/api-client';
import { today } from '../utils/date-helper';

test.describe('Dashboard Search', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto();
  });

  test('filters tickets by reporter name', async ({
    request,
    dashboardPage,
  }) => {
    await createTicket(request, {
      reporter_name: 'Search Alpha',
      source_type: 'Email',
      incident_date: today(),
      description: 'First searchable ticket for reporter filter test',
    });

    await createTicket(request, {
      reporter_name: 'Search Beta',
      source_type: 'Portal',
      incident_date: today(),
      description: 'Second searchable ticket for reporter filter test',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await dashboardPage.searchInput.fill('Alpha');

    await expect(dashboardPage.rowByReporterName('Search Alpha')).toBeVisible();
    await expect(dashboardPage.rowsByReporterName('Search Beta')).toHaveCount(0);
  });

  test('filters tickets by description', async ({ request, dashboardPage }) => {
    await createTicket(request, {
      reporter_name: 'Desc Search One',
      source_type: 'Email',
      incident_date: today(),
      description: 'unique keyword alpha for search testing',
    });

    await createTicket(request, {
      reporter_name: 'Desc Search Two',
      source_type: 'Portal',
      incident_date: today(),
      description: 'unique keyword beta for search testing',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await dashboardPage.searchInput.fill('alpha');

    await expect(dashboardPage.rowByReporterName('Desc Search One')).toBeVisible();
    await expect(
      dashboardPage.rowsByReporterName('Desc Search Two'),
    ).toHaveCount(0);
  });

  test('filters tickets by source type', async ({ request, dashboardPage }) => {
    await createTicket(request, {
      reporter_name: 'Source Search One',
      source_type: 'PDF Upload',
      incident_date: today(),
      description: 'PDF upload source type search verification ticket',
    });

    await createTicket(request, {
      reporter_name: 'Source Search Two',
      source_type: 'Email',
      incident_date: today(),
      description: 'Email source type search verification ticket',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await dashboardPage.searchInput.fill('PDF Upload');

    await expect(
      dashboardPage.rowByReporterName('Source Search One'),
    ).toBeVisible();
    await expect(
      dashboardPage.rowsByReporterName('Source Search Two'),
    ).toHaveCount(0);
  });
});
