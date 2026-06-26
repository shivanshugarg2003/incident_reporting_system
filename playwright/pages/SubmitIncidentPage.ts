import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TicketFormData } from '../fixtures/ticket-data';

export class SubmitIncidentPage extends BasePage {
  readonly path = '/submit';

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  get pageTitle() {
    return this.page.getByRole('heading', { name: 'Report an Incident' });
  }

  get pageSubtitle() {
    return this.page.getByText(
      'Fill in the details below to submit a new incident ticket',
    );
  }

  get reporterNameInput() {
    return this.page.getByLabel('Reporter Name');
  }

  get sourceTypeSelect() {
    return this.page.getByLabel('Source Type');
  }

  get incidentDateInput() {
    return this.page.getByLabel('Incident Date');
  }

  get descriptionTextarea() {
    return this.page.getByLabel('Description');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit Report' });
  }

  get submittingButton() {
    return this.page.getByRole('button', { name: 'Submitting...' });
  }

  get successBanner() {
    return this.page.getByRole('status');
  }

  get errorBanner() {
    return this.page.getByRole('alert');
  }

  get characterCounter() {
    return this.page.locator('p').filter({ hasText: /\/ 2000$/ });
  }

  fileUploadLabel(sourceType: TicketFormData['sourceType']) {
    const labels: Record<TicketFormData['sourceType'], string> = {
      Email: 'Attach Email File',
      Portal: 'Attach Portal Screenshot',
      'PDF Upload': 'Attach PDF Document',
    };
    return this.page.getByLabel(labels[sourceType]);
  }

  fieldError(message: string) {
    return this.page.getByText(message);
  }

  async fillForm(data: TicketFormData): Promise<void> {
    await this.reporterNameInput.fill(data.reporterName);
    await this.sourceTypeSelect.selectOption(data.sourceType);
    await this.incidentDateInput.fill(data.incidentDate);
    await this.descriptionTextarea.fill(data.description);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async blurReporterName(): Promise<void> {
    await this.reporterNameInput.blur();
  }

  async blurSourceType(): Promise<void> {
    await this.sourceTypeSelect.blur();
  }

  async blurIncidentDate(): Promise<void> {
    await this.incidentDateInput.blur();
  }

  async blurDescription(): Promise<void> {
    await this.descriptionTextarea.blur();
  }
}
