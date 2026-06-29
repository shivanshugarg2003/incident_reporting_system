import { useEffect, useState } from 'react'
import axios from 'axios'

/**
 * Dashboard table displaying incident tickets with priority filtering.
 *
 * @returns {import('react').JSX.Element} Ticket dashboard component
 */
function TicketDashboard() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('/tickets')
        setTickets(response.data.tickets)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get('/tickets')
        setTickets(response.data.tickets)
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load tickets')
      }
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'All') return true
    const priority = (ticket.priority || '').trim()
    return priority === filter
  })

  const truncateDescription = (text) => {
    if (!text || text.length <= 50) return text
    return `${text.slice(0, 50)}…`
  }

  const filterOptions = ['All', 'Critical', 'Low']

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
          aria-label="Loading tickets"
        />
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={
              filter === option
                ? 'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white'
                : 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
            }
          >
            {option}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Showing {filteredTickets.length} of {tickets.length} tickets
      </p>

      {filteredTickets.length === 0 ? (
        <p className="py-16 text-center text-gray-500">No tickets found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Reporter Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Source Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Incident Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Attachment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={
                    ticket.priority === 'Critical' ? 'bg-red-50' : 'bg-white'
                  }
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {ticket.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {ticket.reporter_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {ticket.source_type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {ticket.incident_date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {ticket.attachment_filename || '—'}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-gray-700">
                    {truncateDescription(ticket.description)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        ticket.priority === 'Critical'
                          ? 'inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800'
                          : 'inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700'
                      }
                    >
                      {ticket.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TicketDashboard
