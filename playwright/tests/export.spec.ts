import { test, expect } from '../fixtures';
import { createTicket } from '../utils/api-client';
import { today } from '../utils/date-helper';

test.describe('Export Tickets', () => {
  test.beforeEach(async ({ request }) => {
    await createTicket(request, {
      reporter_name: 'Export User',
      source_type: 'Email',
      incident_date: today(),
      description: 'Export functionality verification test ticket',
    });
  });

  test('exports filtered tickets as JSON', async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await dashboardPage.waitForTable();

    const downloadPromise = page.waitForEvent('download');
    await dashboardPage.exportJsonButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/incidents-.*\.json$/);
  });

  test('exports filtered tickets as CSV', async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await dashboardPage.waitForTable();

    const downloadPromise = page.waitForEvent('download');
    await dashboardPage.exportCsvButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/incidents-.*\.csv$/);
  });
});
