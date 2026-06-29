import { useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import PriorityBadge from './PriorityBadge'
import { useNotifications } from '../context/NotificationContext'

/**
 * Format an ISO timestamp for display in the notification list.
 *
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date/time label
 */
function formatNotificationTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Notification bell dropdown with unread count and mark-as-read actions.
 *
 * @param {{ isOpen: boolean, onToggle: Function, onClose: Function }} props - Dropdown props
 * @returns {import('react').JSX.Element} Notification dropdown component
 */
function NotificationDropdown({ isOpen, onToggle, onClose }) {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const panelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <div className="relative inline-flex overflow-visible" ref={panelRef}>
      <button
        type="button"
        onClick={onToggle}
        data-testid="notification-bell"
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-visible rounded-md bg-[#2a3444] text-white hover:bg-[#354156]"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            data-testid="notification-unread-count"
            className="absolute -right-1.5 -top-1.5 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#1a2332]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="notification-dropdown"
          className="absolute right-0 top-full z-[60] mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          <div className="border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications yet
              </p>
            ) : (
              <ul>
                {notifications.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-testid={`notification-item-${item.id}`}
                      onClick={() => markAsRead(item.id)}
                      className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        item.read ? 'opacity-70' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {item.reporterName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatNotificationTime(item.createdAt)}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <PriorityBadge priority={item.priority} />
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
