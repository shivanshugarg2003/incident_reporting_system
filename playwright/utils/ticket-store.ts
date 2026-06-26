import path from 'path';
import fs from 'fs/promises';

export const TICKETS_FILE = path.resolve(__dirname, '../../data/tickets.json');

export interface Ticket {
  id: string;
  reporter_name: string;
  source_type: string;
  incident_date: string;
  description: string;
  attachment_filename: string | null;
  priority: 'Critical' | 'Low';
  created_at: string;
}

export interface TicketsFile {
  tickets: Ticket[];
}

/**
 * Read the current tickets.json contents from disk.
 */
export async function readTicketsFile(): Promise<TicketsFile> {
  const raw = await fs.readFile(TICKETS_FILE, 'utf-8');
  return JSON.parse(raw) as TicketsFile;
}

/**
 * Reset tickets.json to an empty ticket list.
 * Retries briefly to handle file-system sync delays on Windows/OneDrive.
 */
export async function resetTickets(): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await writeTickets([]);
    const data = await readTicketsFile();
    if (data.tickets.length === 0) {
      return;
    }
  }
  throw new Error('Failed to reset tickets.json');
}

/**
 * Write a ticket list to tickets.json.
 */
export async function writeTickets(tickets: Ticket[]): Promise<void> {
  const payload: TicketsFile = { tickets };
  await fs.writeFile(TICKETS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
}
