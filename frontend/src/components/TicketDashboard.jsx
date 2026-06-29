import { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2, Download } from 'lucide-react'
import { getTickets, updateTicket, deleteTicket } from '../api'
import { exportTicketsAsJson, exportTicketsAsCsv } from '../utils/export'
import PriorityBadge from './PriorityBadge'
import ConfirmDialog from './ConfirmDialog'
import EditTicketModal from './EditTicketModal'

const inputClassName =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400'

/**
 * Dashboard table displaying incident tickets with filtering, search, and actions.
 *
 * @returns {import('react').JSX.Element} Ticket dashboard component
 */
function TicketDashboard() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingTicket, setEditingTicket] = useState(null)
  const [deletingTicket, setDeletingTicket] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTickets = async () => {
    try {
      const data = await getTickets()
      setTickets(data.tickets)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()

    const intervalId = setInterval(fetchTickets, 5000)
    return () => clearInterval(intervalId)
  }, [])

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return tickets.filter((ticket) => {
      const priority = (ticket.priority || '').trim()
      if (filter !== 'All' && priority !== filter) return false

      if (!query) return true

      const reporter = (ticket.reporter_name || '').toLowerCase()
      const description = (ticket.description || '').toLowerCase()
      const source = (ticket.source_type || '').toLowerCase()

      return (
        reporter.includes(query) ||
        description.includes(query) ||
        source.includes(query)
      )
    })
  }, [tickets, filter, searchQuery])

  const truncateDescription = (text) => {
    if (!text || text.length <= 50) return text
    return `${text.slice(0, 50)}…`
  }

  const handleSaveEdit = async (payload) => {
    if (!editingTicket) return
    setIsSaving(true)
    try {
      await updateTicket(editingTicket.id, payload)
      setEditingTicket(null)
      await fetchTickets()
    } catch (err) {
      setError(err.message || 'Failed to update ticket')
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingTicket) return
    setIsDeleting(true)
    try {
      await deleteTicket(deletingTicket.id)
      setDeletingTicket(null)
      await fetchTickets()
    } catch (err) {
      setError(err.message || 'Failed to delete ticket')
    } finally {
      setIsDeleting(false)
    }
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

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              data-testid={`filter-${option.toLowerCase()}`}
              onClick={() => setFilter(option)}
              className={
                filter === option
                  ? 'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white'
                  : 'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
              }
            >
              {option === 'All' ? 'All' : option}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="export-json"
            onClick={() => exportTicketsAsJson(filteredTickets)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export JSON
          </button>
          <button
            type="button"
            data-testid="export-csv"
            onClick={() => exportTicketsAsCsv(filteredTickets)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="search"
          data-testid="ticket-search"
          placeholder="Search by reporter, description, or source type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={inputClassName}
        />
      </div>

      <p className="mb-4 text-sm text-gray-600 dark:text-slate-400">
        Showing {filteredTickets.length} of {tickets.length} tickets
      </p>

      {filteredTickets.length === 0 ? (
        <div
          data-testid="empty-state"
          className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-slate-600 dark:bg-slate-900/40"
        >
          <p className="text-lg font-medium text-gray-600 dark:text-slate-300">
            No incidents available
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Submit a new incident or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <table
            data-testid="ticket-table"
            className="min-w-full divide-y divide-gray-200 dark:divide-slate-700"
          >
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-slate-400">
                  Reporter Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Source Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Incident Date
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 sm:table-cell">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Priority
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  data-testid={`ticket-row-${ticket.id}`}
                  className={
                    ticket.priority === 'Critical' ? 'bg-red-50' : 'bg-white'
                  }
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {ticket.reporter_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {ticket.source_type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {ticket.incident_date}
                  </td>
                  <td className="hidden max-w-xs px-4 py-3 text-sm text-gray-700 sm:table-cell">
                    {truncateDescription(ticket.description)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        data-testid={`edit-ticket-${ticket.id}`}
                        onClick={() => setEditingTicket(ticket)}
                        className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                        aria-label={`Edit ticket from ${ticket.reporter_name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-ticket-${ticket.id}`}
                        onClick={() => setDeletingTicket(ticket)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                        aria-label={`Delete ticket from ${ticket.reporter_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditTicketModal
        ticket={editingTicket}
        isOpen={Boolean(editingTicket)}
        onClose={() => setEditingTicket(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTicket)}
        title="Delete Ticket"
        message={`Are you sure you want to delete the incident reported by ${deletingTicket?.reporter_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTicket(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default TicketDashboard
