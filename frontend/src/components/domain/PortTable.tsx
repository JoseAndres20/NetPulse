import React from 'react'
import type { Device } from '../../types'
import { Card } from '../ui/Card'

interface PortTableProps {
  devices: Device[]
  isScanning: boolean
}

export const PortTable: React.FC<PortTableProps> = ({ devices, isScanning }) => {
  // Flatten the devices array to extract all ports with their respective IP
  const allPorts = devices.flatMap(device => 
    (device.ports || []).map(port => ({ ...port, ip: device.ip, hostname: device.hostname }))
  )

  return (
    <Card>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Host IP</th>
              <th>Port</th>
              <th>Protocol</th>
              <th>State</th>
              <th>Service</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {allPorts.map((portData, idx) => (
              <tr key={`${portData.ip}-${portData.port}-${portData.protocol}-${idx}`} className="new-row">
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {portData.ip}
                  {portData.hostname && <span style={{ fontSize: '0.8em', color: 'var(--text-dim)', display: 'block' }}>{portData.hostname}</span>}
                </td>
                <td style={{ fontWeight: 'bold' }}>{portData.port}</td>
                <td style={{ textTransform: 'uppercase', color: 'var(--text-dim)' }}>{portData.protocol}</td>
                <td>
                  <span style={{ 
                    color: portData.state === 'open' ? 'var(--success)' : 'var(--danger)',
                    backgroundColor: portData.state === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.85em',
                    fontWeight: 600
                  }}>
                    {portData.state}
                  </span>
                </td>
                <td>{portData.service || '-'}</td>
                <td style={{ color: 'var(--text-dim)' }}>{portData.version || '-'}</td>
              </tr>
            ))}
            {allPorts.length === 0 && !isScanning && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                  No open ports detected. Click "Deep Port Scan" to begin.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
