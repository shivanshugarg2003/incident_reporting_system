import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'irs-notifications'

/**
 * Load notifications from localStorage.
 *
 * @returns {Array<object>} Stored notification list
 */
function loadNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Persist notifications to localStorage.
 *
 * @param {Array<object>} notifications - Notifications to store
 */
function saveNotifications(notifications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

const NotificationContext = createContext(null)

/**
 * Provide notification state and actions to the application tree.
 *
 * @param {{ children: import('react').ReactNode }} props - Provider props
 * @returns {import('react').JSX.Element} Notification provider wrapper
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadNotifications)

  const addNotification = useCallback((ticket) => {
    const entry = {
      id: crypto.randomUUID(),
      ticketId: ticket.id,
      reporterName: ticket.reporter_name,
      priority: ticket.priority,
      createdAt: ticket.created_at,
      read: false,
    }

    setNotifications((current) => {
      const next = [entry, ...current]
      saveNotifications(next)
      return next
    })
  }, [])

  const markAsRead = useCallback((notificationId) => {
    setNotifications((current) => {
      const next = current.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      )
      saveNotifications(next)
      return next
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((current) => {
      const next = current.map((item) => ({ ...item, read: true }))
      saveNotifications(next)
      return next
    })
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  )

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [notifications],
  )

  const value = useMemo(
    () => ({
      notifications: sortedNotifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
    }),
    [
      sortedNotifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
    ],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * Access notification state and actions.
 *
 * @returns {object} Notification context value
 */
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
