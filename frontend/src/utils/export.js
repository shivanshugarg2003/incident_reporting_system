/**
 * Trigger a browser download for the given content.
 *
 * @param {string} content - File content
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type for the blob
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Export tickets as a JSON file download.
 *
 * @param {Array<object>} tickets - Ticket records to export
 */
export function exportTicketsAsJson(tickets) {
  const content = JSON.stringify({ tickets }, null, 2)
  downloadFile(content, `incidents-${Date.now()}.json`, 'application/json')
}

/**
 * Export tickets as a CSV file download.
 *
 * @param {Array<object>} tickets - Ticket records to export
 */
export function exportTicketsAsCsv(tickets) {
  const headers = [
    'id',
    'reporter_name',
    'source_type',
    'incident_date',
    'description',
    'priority',
    'status',
    'created_at',
    'attachment_filename',
  ]

  const escapeCsv = (value) => {
    const text = value == null ? '' : String(value)
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const rows = tickets.map((ticket) =>
    headers.map((header) => escapeCsv(ticket[header])).join(','),
  )

  const content = [headers.join(','), ...rows].join('\n')
  downloadFile(content, `incidents-${Date.now()}.csv`, 'text/csv')
}
