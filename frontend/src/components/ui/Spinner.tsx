import React from 'react'

interface SpinnerProps {
  size?: number
  color?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 16, color = '#fff' }) => {
  return (
    <span 
      className="loader" 
      style={{ 
        width: size, 
        height: size, 
        border: `2px solid ${color}`, 
        borderBottomColor: 'transparent' 
      }} 
    />
  )
}
