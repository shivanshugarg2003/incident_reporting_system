import { APIRequestContext } from '@playwright/test';

const API_BASE_URL = 'http://127.0.0.1:5000';

export interface CreateTicketPayload {
  reporter_name: string;
  source_type: string;
  incident_date: string;
  description: string;
  attachment_filename?: string | null;
}

export interface TicketResponse extends CreateTicketPayload {
  id: string;
  priority: 'Critical' | 'Low';
  created_at: string;
  attachment_filename: string | null;
}

export interface TicketsListResponse {
  tickets: TicketResponse[];
}

/**
 * Create a ticket via the Flask API directly (bypasses UI).
 */
export async function createTicket(
  request: APIRequestContext,
  payload: CreateTicketPayload,
): Promise<TicketResponse> {
  const response = await request.post(`${API_BASE_URL}/tickets`, {
    data: payload,
  });

  if (!response.ok()) {
    throw new Error(
      `createTicket failed: ${response.status()} ${await response.text()}`,
    );
  }

  return response.json() as Promise<TicketResponse>;
}

/**
 * Fetch all tickets via the Flask API directly.
 */
export async function getTickets(
  request: APIRequestContext,
): Promise<TicketsListResponse> {
  const response = await request.get(`${API_BASE_URL}/tickets`);
  return response.json() as Promise<TicketsListResponse>;
}

/**
 * Create a ticket and return the full HTTP response for status/body assertions.
 */
export async function createTicketRaw(
  request: APIRequestContext,
  payload: Partial<CreateTicketPayload>,
) {
  return request.post(`${API_BASE_URL}/tickets`, { data: payload });
}
