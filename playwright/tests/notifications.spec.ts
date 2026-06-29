import { test, expect } from '../fixtures';
import { lowPriorityTicket } from '../fixtures/ticket-data';

test.describe('Notification System', () => {
  test.beforeEach(async ({ page, submitPage }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('irs-notifications');
    });
    await submitPage.goto();
  });

  test('shows unread count after creating an incident', async ({
    submitPage,
    navbar,
  }) => {
    await submitPage.fillForm(lowPriorityTicket);
    await submitPage.submit();
    await expect(submitPage.successBanner).toBeVisible();

    await expect(navbar.notificationUnreadCount).toBeVisible();
    await expect(navbar.notificationUnreadCount).toHaveText('1');
  });

  test('opens dropdown with notification details', async ({
    submitPage,
    navbar,
  }) => {
    await submitPage.fillForm({
      ...lowPriorityTicket,
      reporterName: 'Notify User',
      description: 'Notification dropdown verification test case',
    });
    await submitPage.submit();
    await expect(submitPage.successBanner).toBeVisible();

    await navbar.openNotifications();
    await expect(navbar.notificationDropdown).toBeVisible();
    await expect(navbar.notificationDropdown).toContainText('Notify User');
    await expect(navbar.notificationDropdown).toContainText('Low');
  });

  test('marks notification as read and updates count', async ({
    submitPage,
    navbar,
    page,
  }) => {
    await submitPage.fillForm({
      ...lowPriorityTicket,
      reporterName: 'Read Test User',
      description: 'Mark as read notification verification test',
    });
    await submitPage.submit();
    await expect(submitPage.successBanner).toBeVisible();

    await navbar.openNotifications();
    const notificationItem = page.getByTestId(/notification-item-/).first();
    await notificationItem.click();

    await expect(navbar.notificationUnreadCount).toHaveCount(0);
  });
});
