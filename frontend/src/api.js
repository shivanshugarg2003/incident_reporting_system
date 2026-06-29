import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({ baseURL: BASE_URL })

/**
 * Fetch all incident tickets from the API.
 *
 * @returns {Promise<{ tickets: Array<object> }>} Tickets response payload
 */
export async function getTickets() {
  const response = await client.get('/tickets')
  return response.data
}

/**
 * Create a new incident ticket.
 *
 * @param {object} payload - Ticket fields for creation
 * @returns {Promise<object>} Created ticket
 */
export async function createTicket(payload) {
  const response = await client.post('/tickets', payload)
  return response.data
}

/**
 * Update an existing ticket by ID.
 *
 * @param {string} ticketId - Ticket UUID
 * @param {object} payload - Fields to update
 * @returns {Promise<object>} Updated ticket
 */
export async function updateTicket(ticketId, payload) {
  const response = await client.put(`/tickets/${ticketId}`, payload)
  return response.data
}

/**
 * Delete a ticket by ID.
 *
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<object>} Deletion confirmation
 */
export async function deleteTicket(ticketId) {
  const response = await client.delete(`/tickets/${ticketId}`)
  return response.data
}
