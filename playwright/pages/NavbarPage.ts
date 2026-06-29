import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavbarPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get appTitle() {
    return this.page.getByTestId('app-title');
  }

  get submitIncidentLink() {
    return this.page.getByRole('link', { name: 'Submit Incident' });
  }

  get dashboardLink() {
    return this.page.getByRole('link', { name: 'Dashboard' });
  }

  get themeToggle() {
    return this.page.getByTestId('theme-toggle');
  }

  get notificationBell() {
    return this.page.getByTestId('notification-bell');
  }

  get notificationUnreadCount() {
    return this.page.getByTestId('notification-unread-count');
  }

  get notificationDropdown() {
    return this.page.getByTestId('notification-dropdown');
  }

  async goToSubmit(): Promise<void> {
    await this.submitIncidentLink.click();
  }

  async goToDashboard(): Promise<void> {
    await this.dashboardLink.click();
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  async openNotifications(): Promise<void> {
    await this.notificationBell.click();
  }
}
