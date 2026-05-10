import React, { type ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  loadingText = 'Loading...', 
  variant = 'primary',
  className = '', 
  ...props 
}) => {
  const baseClass = 'btn-scan'
  const variantClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary'
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
