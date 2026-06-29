import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class NavbarPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get appTitle() {
    return this.page.getByText('IDS React', { exact: true });
  }

  get submitIncidentLink() {
    return this.page.getByRole('link', { name: 'Submit Incident' });
  }

  get dashboardLink() {
    return this.page.getByRole('link', { name: 'Dashboard' });
  }

  async goToSubmit(): Promise<void> {
    await this.submitIncidentLink.click();
  }

  async goToDashboard(): Promise<void> {
    await this.dashboardLink.click();
  }
}
