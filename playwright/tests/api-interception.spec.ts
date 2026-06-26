import { test, expect } from '../fixtures';
import { invalidApiTicket, lowPriorityTicket } from '../fixtures/ticket-data';
import { createTicketRaw } from '../utils/api-client';
import { today } from '../utils/date-helper';

test.describe('API Interception & Contract', () => {
  test('POST /tickets sends correct request payload from UI', async ({
    submitPage,
    page,
  }) => {
    await submitPage.goto();

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/tickets') &&
        request.method() === 'POST',
    );

    await submitPage.fillForm({
      ...lowPriorityTicket,
      reporterName: 'Payload Tester',
    });
    await submitPage.submit();

    const request = await requestPromise;
    const payload = request.postDataJSON();

    expect(payload).toEqual({
      reporter_name: 'Payload Tester',
      source_type: lowPriorityTicket.sourceType,
      incident_date: lowPriorityTicket.incidentDate,
      description: lowPriorityTicket.description,
      attachment_filename: null,
    });
  });

  test('POST /tickets returns 201 with expected response body', async ({
    submitPage,
    page,
  }) => {
    await submitPage.goto();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/tickets') &&
        response.request().method() === 'POST',
    );

    await submitPage.fillForm(lowPriorityTicket);
    await submitPage.submit();

    const response = await responsePromise;
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toMatchObject({
      reporter_name: lowPriorityTicket.reporterName,
      source_type: lowPriorityTicket.sourceType,
      incident_date: lowPriorityTicket.incidentDate,
      description: lowPriorityTicket.description,
      attachment_filename: null,
      priority: 'Low',
    });
    expect(body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.created_at).toMatch(/Z$/);
  });

  test('GET /tickets returns 200 with tickets array', async ({
    request,
    page,
  }) => {
    await createTicketRaw(request, {
      reporter_name: 'API Reader',
      source_type: 'Email',
      incident_date: today(),
      description: 'Ticket created for GET endpoint verification test',
    });

    const response = await page.request.get('http://localhost:5173/tickets');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('tickets');
    expect(Array.isArray(body.tickets)).toBe(true);
    expect(body.tickets.length).toBeGreaterThanOrEqual(1);
    expect(body.tickets[0]).toHaveProperty('reporter_name');
    expect(body.tickets[0]).toHaveProperty('priority');
  });

  test('POST /tickets returns 400 when required field is missing', async ({
    request,
  }) => {
    const response = await createTicketRaw(request, invalidApiTicket);
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toEqual({
      error: 'Missing required field: description',
    });
  });
});
