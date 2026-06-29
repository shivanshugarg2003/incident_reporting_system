import TicketDashboard from '../components/TicketDashboard'

/**
 * Dashboard page displaying the ticket list and filters.
 *
 * @returns {import('react').JSX.Element} Dashboard page
 */
function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-800">Dashboard</h1>
      <TicketDashboard />
    </div>
  )
}

export default DashboardPage
