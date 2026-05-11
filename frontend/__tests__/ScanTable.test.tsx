import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ScanTable } from '../src/components/scans/ScanTable'
import type { Scan } from '../src/types'

const mockScans: Scan[] = [
  {
    id: '1',
    target: '192.168.1.0/24',
    status: 'completed',
    startedAt: '2024-01-15T10:00:00Z',
    devicesFound: 5
  },
  {
    id: '2',
    target: '10.0.0.0/24',
    status: 'running',
    startedAt: '2024-01-15T11:00:00Z',
    devicesFound: 2
  },
  {
    id: '3',
    target: '172.16.0.0/24',
    status: 'failed',
    startedAt: '2024-01-15T12:00:00Z',
    devicesFound: 0
  }
]

describe('ScanTable', () => {
  it('renders scan data', () => {
    const handleScanClick = vi.fn()
    render(
      <ScanTable 
        scans={mockScans} 
        onScanClick={handleScanClick} 
      />
    )
    
    expect(screen.getByText('192.168.1.0/24')).toBeDefined()
    expect(screen.getByText('10.0.0.0/24')).toBeDefined()
  })

  it('shows empty state when no scans', () => {
    const handleScanClick = vi.fn()
    render(
      <ScanTable 
        scans={[]} 
        onScanClick={handleScanClick} 
      />
    )
    
    expect(screen.getByText('No scan history found.')).toBeDefined()
  })

  it('renders with delete button when onDeleteClick provided', () => {
    const handleScanClick = vi.fn()
    const handleDeleteClick = vi.fn()
    
    render(
      <ScanTable 
        scans={mockScans} 
        onScanClick={handleScanClick}
        onDeleteClick={handleDeleteClick}
      />
    )
    
    const deleteButtons = document.querySelectorAll('button[title="Delete scan"]')
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('does not render delete column when onDeleteClick not provided', () => {
    const handleScanClick = vi.fn()
    
    render(
      <ScanTable 
        scans={mockScans} 
        onScanClick={handleScanClick}
      />
    )
    
    const deleteButtons = document.querySelectorAll('button[title="Delete scan"]')
    expect(deleteButtons.length).toBe(0)
  })

  it('renders correct headers', () => {
    const handleScanClick = vi.fn()
    render(
      <ScanTable 
        scans={mockScans} 
        onScanClick={handleScanClick} 
      />
    )
    
    expect(screen.getByText('Date / Time')).toBeDefined()
    expect(screen.getByText('Target')).toBeDefined()
    expect(screen.getByText('Devices Found')).toBeDefined()
    expect(screen.getByText('Status')).toBeDefined()
  })
})