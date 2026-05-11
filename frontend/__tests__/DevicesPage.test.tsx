import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ScanProvider } from '../src/contexts/ScanContext'
import { DevicesPage } from '../src/pages/DevicesPage'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ScanProvider>
        {component}
      </ScanProvider>
    </BrowserRouter>
  )
}

describe('DevicesPage', () => {
  it('renders the page title', () => {
    renderWithProviders(<DevicesPage />)
    expect(screen.getByText('Network Discovery')).toBeDefined()
  })

  it('renders input field for target', () => {
    renderWithProviders(<DevicesPage />)
    expect(screen.getByPlaceholderText('IP range (e.g., 192.168.1.0/24)')).toBeDefined()
  })

  it('renders start scan button', () => {
    renderWithProviders(<DevicesPage />)
    expect(screen.getByText('Start Scan')).toBeDefined()
  })

  it('allows typing in target input', () => {
    renderWithProviders(<DevicesPage />)
    const input = screen.getByPlaceholderText('IP range (e.g., 192.168.1.0/24)')
    
    fireEvent.change(input, { target: { value: '192.168.1.0/24' } })
    expect((input as HTMLInputElement).value).toBe('192.168.1.0/24')
  })
})