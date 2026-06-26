import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly path = '/dashboard';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  get pageTitle() {
    return this.page.getByRole('heading', { name: 'Dashboard' });
  }

  get loadingSpinner() {
    return this.page.getByLabel('Loading tickets');
  }

  get errorBanner() {
    return this.page.getByRole('alert');
  }

  get emptyState() {
    return this.page.getByText('No tickets found.');
  }

  get ticketTable() {
    return this.page.getByRole('table');
  }

  get dataRows() {
    return this.page.locator('tbody tr');
  }

  filterButton(name: 'All' | 'Critical' | 'Low') {
    return this.page.getByRole('button', { name });
  }

  ticketCountLine(showing: number, total: number) {
    return this.page.getByText(`Showing ${showing} of ${total} tickets`);
  }

  rowByReporterName(name: string): Locator {
    return this.dataRows.filter({ hasText: name }).first();
  }

  rowsByReporterName(name: string): Locator {
    return this.dataRows.filter({ hasText: name });
  }

  priorityBadgeInRow(reporterName: string, priority: 'Critical' | 'Low') {
    return this.rowByReporterName(reporterName)
      .getByText(priority, { exact: true })
      .first();
  }

  async waitForTable(): Promise<void> {
    await this.ticketTable.waitFor({ state: 'visible' });
  }

  async selectFilter(filter: 'All' | 'Critical' | 'Low'): Promise<void> {
    await this.filterButton(filter).click();
  }

  firstDataRow(): Locator {
    return this.dataRows.first();
  }
}
