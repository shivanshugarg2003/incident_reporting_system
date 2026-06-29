import { useEffect, useState } from 'react'

const SOURCE_TYPE_OPTIONS = ['Email', 'Portal', 'PDF Upload']

/**
 * Modal form for editing an existing incident ticket.
 *
 * @param {{ ticket: object|null, isOpen: boolean, onClose: Function, onSave: Function, isSaving?: boolean }} props - Modal props
 * @returns {import('react').JSX.Element|null} Edit modal or null when closed
 */
function EditTicketModal({ ticket, isOpen, onClose, onSave, isSaving = false }) {
  const [formData, setFormData] = useState({
    reporterName: '',
    sourceType: '',
    incidentDate: '',
    description: '',
    status: 'Open',
  })

  useEffect(() => {
    if (ticket) {
      setFormData({
        reporterName: ticket.reporter_name || '',
        sourceType: ticket.source_type || '',
        incidentDate: ticket.incident_date || '',
        description: ticket.description || '',
        status: ticket.status || 'Open',
      })
    }
  }, [ticket])

  if (!isOpen || !ticket) return null

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      reporter_name: formData.reporterName.trim(),
      source_type: formData.sourceType,
      incident_date: formData.incidentDate,
      description: formData.description.trim(),
      status: formData.status,
    })
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600'

  const labelClass = 'mb-1 block text-sm font-normal text-gray-600'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-ticket-title"
      data-testid="edit-ticket-modal"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2
          id="edit-ticket-title"
          className="text-lg font-semibold text-gray-800"
        >
          Edit Ticket
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-reporter-name" className={labelClass}>
              Reporter Name
            </label>
            <input
              id="edit-reporter-name"
              data-testid="edit-reporter-name"
              type="text"
              required
              value={formData.reporterName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reporterName: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <span className={labelClass}>
              Source Type
            </span>
            <div className="flex flex-wrap gap-4">
              {SOURCE_TYPE_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="editSourceType"
                    value={option}
                    checked={formData.sourceType === option}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sourceType: e.target.value }))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="edit-incident-date" className={labelClass}>
              Incident Date
            </label>
            <input
              id="edit-incident-date"
              data-testid="edit-incident-date"
              type="date"
              required
              max={today}
              value={formData.incidentDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, incidentDate: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="edit-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="edit-description"
              data-testid="edit-description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="edit-status" className={labelClass}>
              Status
            </label>
            <select
              id="edit-status"
              data-testid="edit-status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className={inputClass}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              data-testid="edit-ticket-cancel"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              data-testid="edit-ticket-save"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTicketModal
