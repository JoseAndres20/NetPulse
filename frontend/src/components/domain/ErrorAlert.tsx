import React from 'react'

export const ErrorAlert: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div style={{ 
      color: '#ef4444', 
      marginBottom: '1rem', 
      padding: '1rem', 
      background: 'rgba(239, 68, 68, 0.1)', 
      borderRadius: '10px' 
    }}>
      {message}
    </div>
  )
}
