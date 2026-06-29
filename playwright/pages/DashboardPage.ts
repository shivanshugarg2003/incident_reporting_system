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
    return this.page.getByTestId('empty-state');
  }

  get ticketTable() {
    return this.page.getByTestId('ticket-table');
  }

  get searchInput() {
    return this.page.getByTestId('ticket-search');
  }

  get exportJsonButton() {
    return this.page.getByTestId('export-json');
  }

  get exportCsvButton() {
    return this.page.getByTestId('export-csv');
  }

  get dataRows() {
    return this.page.locator('tbody tr');
  }

  filterButton(name: 'All' | 'Critical' | 'Low') {
    return this.page.getByTestId(`filter-${name.toLowerCase()}`);
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
      .getByTestId(`priority-badge-${priority}`)
      .first();
  }

  editButtonForReporter(name: string) {
    return this.rowByReporterName(name).getByRole('button', { name: new RegExp(`Edit ticket from ${name}`) });
  }

  deleteButtonForReporter(name: string) {
    return this.rowByReporterName(name).getByRole('button', { name: new RegExp(`Delete ticket from ${name}`) });
  }

  async waitForTable(): Promise<void> {
    await this.ticketTable.waitFor({ state: 'visible' });
  }

  async waitForLoaded(): Promise<void> {
    await this.loadingSpinner.waitFor({ state: 'hidden' });
  }

  async selectFilter(filter: 'All' | 'Critical' | 'Low'): Promise<void> {
    await this.filterButton(filter).click();
  }

  firstDataRow(): Locator {
    return this.dataRows.first();
  }
}
