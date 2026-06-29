import { test, expect } from '../fixtures';
import {
  createTicket,
  updateTicket,
  updateTicketRaw,
  deleteTicket,
  deleteTicketRaw,
  getTickets,
} from '../utils/api-client';
import { today } from '../utils/date-helper';

test.describe('API CRUD — PUT and DELETE /tickets/:id', () => {
  test('PUT /tickets/:id updates ticket fields', async ({ request }) => {
    const ticket = await createTicket(request, {
      reporter_name: 'PUT Test User',
      source_type: 'Email',
      incident_date: today(),
      description: 'Minor cosmetic issue for PUT verification test',
    });

    const updated = await updateTicket(request, ticket.id, {
      reporter_name: 'PUT Updated User',
      description: 'system down in production for PUT test',
      status: 'In Progress',
    });

    expect(updated.reporter_name).toBe('PUT Updated User');
    expect(updated.priority).toBe('Critical');
    expect(updated.status).toBe('In Progress');
  });

  test('PUT /tickets/:id returns 404 for unknown id', async ({ request }) => {
    const response = await updateTicketRaw(request, '00000000-0000-0000-0000-000000000000', {
      description: 'system down test',
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Ticket not found');
  });

  test('DELETE /tickets/:id removes ticket', async ({ request }) => {
    const ticket = await createTicket(request, {
      reporter_name: 'DELETE Test User',
      source_type: 'Portal',
      incident_date: today(),
      description: 'Ticket to be deleted via API verification test',
    });

    await deleteTicket(request, ticket.id);

    const { tickets } = await getTickets(request);
    expect(tickets.find((item) => item.id === ticket.id)).toBeUndefined();
  });

  test('DELETE /tickets/:id returns 404 for unknown id', async ({ request }) => {
    const response = await deleteTicketRaw(
      request,
      '00000000-0000-0000-0000-000000000000',
    );

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Ticket not found');
  });
});
