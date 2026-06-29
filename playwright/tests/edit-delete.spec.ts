import { test, expect } from '../fixtures';
import { createTicket } from '../utils/api-client';
import { today } from '../utils/date-helper';

test.describe('Edit and Delete Tickets', () => {
  test('edits a ticket from the dashboard', async ({
    request,
    dashboardPage,
    page,
  }) => {
    await createTicket(request, {
      reporter_name: 'Edit Target',
      source_type: 'Email',
      incident_date: today(),
      description: 'Original description for edit ticket verification',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await dashboardPage.editButtonForReporter('Edit Target').click();

    await expect(page.getByTestId('edit-ticket-modal')).toBeVisible();
    await page.getByTestId('edit-reporter-name').fill('Edited Reporter');
    await page.getByTestId('edit-description').fill(
      'Updated description after edit with enough length',
    );
    await page.getByTestId('edit-ticket-save').click();

    await expect(page.getByTestId('edit-ticket-modal')).toHaveCount(0);
    await expect(dashboardPage.rowByReporterName('Edited Reporter')).toBeVisible();
  });

  test('deletes a ticket with confirmation dialog', async ({
    request,
    dashboardPage,
    page,
  }) => {
    await createTicket(request, {
      reporter_name: 'Delete Target',
      source_type: 'Portal',
      incident_date: today(),
      description: 'Ticket scheduled for delete verification test case',
    });

    await dashboardPage.goto();
    await dashboardPage.waitForTable();
    await dashboardPage.deleteButtonForReporter('Delete Target').click();

    await expect(page.getByTestId('confirm-dialog')).toBeVisible();
    await page.getByTestId('confirm-dialog-confirm').click();

    await expect(page.getByTestId('confirm-dialog')).toHaveCount(0);
    await expect(
      dashboardPage.rowsByReporterName('Delete Target'),
    ).toHaveCount(0);
  });
});
