import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/**
 * Theme toggle button for switching between light and dark modes.
 *
 * @returns {import('react').JSX.Element} Theme toggle control
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2a3444] text-white hover:bg-[#354156]"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}

export default ThemeToggle
