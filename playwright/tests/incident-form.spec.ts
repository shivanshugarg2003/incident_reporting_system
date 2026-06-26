import { test, expect } from '../fixtures';
import { lowPriorityTicket } from '../fixtures/ticket-data';
import { tomorrow } from '../utils/date-helper';

test.describe('Incident Form', () => {
  test.beforeEach(async ({ submitPage }) => {
    await submitPage.goto();
  });

  test('submit page loads successfully', async ({ submitPage }) => {
    await expect(submitPage.pageTitle).toBeVisible();
    await expect(submitPage.pageSubtitle).toBeVisible();
  });

  test('all required fields are visible', async ({ submitPage }) => {
    await expect(submitPage.reporterNameInput).toBeVisible();
    await expect(submitPage.sourceTypeSelect).toBeVisible();
    await expect(submitPage.incidentDateInput).toBeVisible();
    await expect(submitPage.descriptionTextarea).toBeVisible();
    await expect(submitPage.submitButton).toBeVisible();
  });

  test('submit button is disabled when form is empty', async ({
    submitPage,
  }) => {
    await expect(submitPage.submitButton).toBeDisabled();
  });

  test('shows validation error when reporter name is empty on blur', async ({
    submitPage,
  }) => {
    await submitPage.reporterNameInput.focus();
    await submitPage.blurReporterName();
    await expect(
      submitPage.fieldError('Reporter name is required'),
    ).toBeVisible();
  });

  test('shows validation error when reporter name is too short on blur', async ({
    submitPage,
  }) => {
    await submitPage.reporterNameInput.fill('A');
    await submitPage.blurReporterName();
    await expect(
      submitPage.fieldError('Must be at least 2 characters'),
    ).toBeVisible();
  });

  test('shows validation error when source type is not selected on blur', async ({
    submitPage,
  }) => {
    await submitPage.sourceTypeSelect.focus();
    await submitPage.blurSourceType();
    await expect(
      submitPage.fieldError('Please select a source type'),
    ).toBeVisible();
  });

  test('shows validation error when incident date is empty on blur', async ({
    submitPage,
  }) => {
    await submitPage.incidentDateInput.focus();
    await submitPage.blurIncidentDate();
    await expect(
      submitPage.fieldError('Incident date is required'),
    ).toBeVisible();
  });

  test('shows validation error when description is too short on blur', async ({
    submitPage,
  }) => {
    await submitPage.descriptionTextarea.fill('short');
    await submitPage.blurDescription();
    await expect(
      submitPage.fieldError('Description must be at least 10 characters'),
    ).toBeVisible();
  });

  test('shows conditional file upload after selecting source type', async ({
    submitPage,
  }) => {
    await submitPage.sourceTypeSelect.selectOption('Email');
    await expect(submitPage.fileUploadLabel('Email')).toBeVisible();
    await expect(
      submitPage.page.getByText('Accepted formats: .eml .msg .pdf'),
    ).toBeVisible();
  });

  test('updates live character counter for description', async ({
    submitPage,
  }) => {
    const text = '1234567890';
    await submitPage.descriptionTextarea.fill(text);
    await expect(submitPage.characterCounter).toHaveText('10 / 2000');
  });

  test('submits a valid incident and shows success banner', async ({
    submitPage,
    page,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/tickets') &&
        response.request().method() === 'POST',
    );

    await submitPage.fillForm(lowPriorityTicket);
    await submitPage.submit();

    const response = await responsePromise;
    expect(response.status()).toBe(201);

    await expect(submitPage.successBanner).toHaveText(
      'Ticket submitted successfully!',
    );
  });

  test('resets form fields after successful submission', async ({
    submitPage,
  }) => {
    await submitPage.fillForm(lowPriorityTicket);
    await submitPage.submit();

    await expect(submitPage.successBanner).toBeVisible();
    await expect(submitPage.reporterNameInput).toHaveValue('');
    await expect(submitPage.sourceTypeSelect).toHaveValue('');
    await expect(submitPage.incidentDateInput).toHaveValue('');
    await expect(submitPage.descriptionTextarea).toHaveValue('');
    await expect(submitPage.characterCounter).toHaveText('0 / 2000');
  });

  test('shows submitting state while request is in progress', async ({
    submitPage,
    page,
  }) => {
    await page.route('**/tickets', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.continue();
      } else {
        await route.continue();
      }
    });

    await submitPage.fillForm(lowPriorityTicket);
    await submitPage.submit();

    await expect(submitPage.submittingButton).toBeVisible();
    await expect(submitPage.successBanner).toBeVisible();
  });

  test('shows validation error for future incident date on blur', async ({
    submitPage,
  }) => {
    await submitPage.incidentDateInput.fill(tomorrow());
    await submitPage.blurIncidentDate();
    await expect(
      submitPage.fieldError('Date cannot be in the future'),
    ).toBeVisible();
  });
});
