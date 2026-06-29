import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'irs-theme'

const ThemeContext = createContext(null)

/**
 * Resolve the initial theme from localStorage or system preference.
 *
 * @returns {'light' | 'dark'} Initial theme value
 */
function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Provide light/dark theme state to the application tree.
 *
 * @param {{ children: import('react').ReactNode }} props - Provider props
 * @returns {import('react').JSX.Element} Theme provider wrapper
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getInitialTheme())

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () =>
        setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
      setTheme,
    }),
    [theme],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

/**
 * Access the current theme and toggle helpers.
 *
 * @returns {{ theme: string, isDark: boolean, toggleTheme: Function, setTheme: Function }}
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
