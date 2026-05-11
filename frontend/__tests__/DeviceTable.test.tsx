import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { DeviceTable } from '../src/components/domain/DeviceTable'
import type { Device } from '../src/types'

const mockDevices: Device[] = [
  { id: '1', ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:FF', hostname: 'router', vendor: 'TP-Link', status: 'online', is_gateway: true },
  { id: '2', ip: '192.168.1.10', mac: '11:22:33:44:55:66', hostname: 'laptop', vendor: 'Apple', status: 'online', is_gateway: false },
]

describe('DeviceTable', () => {
  it('should render table headers', () => {
    render(<DeviceTable devices={[]} isScanning={false} />)
    expect(screen.getByText('IP Address')).toBeDefined()
    expect(screen.getByText('MAC Address')).toBeDefined()
    expect(screen.getByText('Hostname')).toBeDefined()
    expect(screen.getByText('Vendor')).toBeDefined()
    expect(screen.getByText('Status')).toBeDefined()
  })

  it('should render devices', () => {
    render(<DeviceTable devices={mockDevices} isScanning={false} />)
    expect(screen.getByText('192.168.1.1')).toBeDefined()
    expect(screen.getByText('192.168.1.10')).toBeDefined()
    expect(screen.getByText('router')).toBeDefined()
  })

  it('should show empty message when no devices', () => {
    render(<DeviceTable devices={[]} isScanning={false} />)
    expect(screen.getByText(/No devices detected/i)).toBeDefined()
  })

  it('should not show empty message when scanning', () => {
    render(<DeviceTable devices={[]} isScanning={true} />)
    expect(screen.queryByText(/No devices detected/i)).toBeNull()
  })

  it('should display Unknown for missing hostname', () => {
    const devicesWithoutHostname: Device[] = [{ id: '1', ip: '192.168.1.1', status: 'online' }]
    render(<DeviceTable devices={devicesWithoutHostname} isScanning={false} />)
    expect(screen.getByText('Unknown')).toBeDefined()
  })
})