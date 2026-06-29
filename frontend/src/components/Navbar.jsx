import { NavLink } from 'react-router-dom'
import { Bell, Settings, ToggleRight, User } from 'lucide-react'

/**
 * Top navigation bar with links to main application pages.
 *
 * @returns {import('react').JSX.Element} Application navbar
 */
function Navbar() {
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-sm font-medium text-white'
      : 'text-sm font-normal text-gray-300 hover:text-white'

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#2a3444] bg-[#1a2332]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-white">IDS React</span>
          <div className="flex items-center gap-5">
            <NavLink to="/submit" className={navLinkClass}>
              Submit Incident
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2a3444] text-white hover:bg-[#354156]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2a3444] text-white hover:bg-[#354156]"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2a3444] text-white hover:bg-[#354156]"
            aria-label="Toggle"
          >
            <ToggleRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-[#2a3444] px-3 py-1.5">
            <User className="h-4 w-4 text-white" />
            <span className="text-sm text-white">Marta Alvarez</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
