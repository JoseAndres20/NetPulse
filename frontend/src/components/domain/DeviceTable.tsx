import React from 'react'
import type { Device } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface DeviceTableProps {
  devices: Device[]
  isScanning: boolean
}

export const DeviceTable: React.FC<DeviceTableProps> = ({ devices, isScanning }) => {
  return (
    <Card>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>IP Address</th>
              <th>MAC Address</th>
              <th>Hostname</th>
              <th>Vendor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.ip} className="new-row">
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{device.ip}</td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{device.mac}</td>
                <td>{device.hostname || <span style={{ color: 'var(--text-dim)', opacity: 0.7 }}>Unknown</span>}</td>
                <td>{device.vendor}</td>
                <td>
                  <Badge status={device.status} isOnline={device.status === 'online'} />
                </td>
              </tr>
            ))}
            {devices.length === 0 && !isScanning && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                  No devices detected. Click "Full Network Scan" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
