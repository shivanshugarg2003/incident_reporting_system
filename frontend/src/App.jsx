import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import SubmitPage from './pages/SubmitPage'
import DashboardPage from './pages/DashboardPage'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'

/**
 * Root application component with routing and layout.
 *
 * @returns {import('react').JSX.Element} Application shell
 */
function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div
            data-testid="app-shell"
            className="min-h-screen bg-[#F0F2F5] pt-14 transition-colors duration-300 dark:bg-slate-900"
          >
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/submit" replace />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
