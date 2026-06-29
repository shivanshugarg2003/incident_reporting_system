/**
 * Render a priority badge with color-coded styling.
 *
 * @param {{ priority: 'Critical' | 'Low' | string }} props - Badge props
 * @returns {import('react').JSX.Element} Priority badge element
 */
function PriorityBadge({ priority }) {
  const isCritical = priority === 'Critical'

  return (
    <span
      data-testid={`priority-badge-${priority}`}
      className={
        isCritical
          ? 'inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800'
          : 'inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800'
      }
    >
      {priority}
    </span>
  )
}

export default PriorityBadge
