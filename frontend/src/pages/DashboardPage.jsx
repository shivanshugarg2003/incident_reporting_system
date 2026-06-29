import TicketDashboard from '../components/TicketDashboard'

/**
 * Dashboard page displaying the ticket list and filters.
 *
 * @returns {import('react').JSX.Element} Dashboard page
 */
function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div
        data-testid="dashboard-card"
        className="rounded-lg border border-gray-200 bg-white px-8 py-8 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            View, filter, and manage all reported incidents.
          </p>
        </div>
        <TicketDashboard />
      </div>
    </div>
  )
}

export default DashboardPage
