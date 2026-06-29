import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import SubmitPage from './pages/SubmitPage'
import DashboardPage from './pages/DashboardPage'

/**
 * Root application component with routing and layout.
 *
 * @returns {import('react').JSX.Element} Application shell
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F0F2F5] pt-14">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/submit" replace />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
