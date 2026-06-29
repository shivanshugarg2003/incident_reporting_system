import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const storedTheme = localStorage.getItem('irs-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initialTheme =
  storedTheme === 'light' || storedTheme === 'dark'
    ? storedTheme
    : prefersDark
      ? 'dark'
      : 'light'

if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
