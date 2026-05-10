import React, { type ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  loadingText = 'Loading...', 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`btn-scan ${className}`} 
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
