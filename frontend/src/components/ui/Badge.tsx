import React from 'react'

interface BadgeProps {
  status: string
  isOnline?: boolean
}

export const Badge: React.FC<BadgeProps> = ({ status, isOnline = true }) => {
  const badgeClass = isOnline ? 'status-online' : ''
  const dotColor = isOnline ? 'currentColor' : '#666'

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor }}></span>
      {status}
    </span>
  )
}
