import { NavLink } from 'react-router-dom'

/**
 * Top navigation bar with links to main application pages.
 *
 * @returns {import('react').JSX.Element} Application navbar
 */
function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl gap-6 px-4 py-4">
        <NavLink
          to="/submit"
          className={({ isActive }) =>
            isActive
              ? 'text-sm font-semibold text-blue-600'
              : 'text-sm font-medium text-slate-600 hover:text-slate-900'
          }
        >
          Submit Incident
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? 'text-sm font-semibold text-blue-600'
              : 'text-sm font-medium text-slate-600 hover:text-slate-900'
          }
        >
          Dashboard
        </NavLink>
      </div>
    </nav>
  )
}

export default Navbar
