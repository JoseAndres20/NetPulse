import React, { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

interface Scan {
  id: string
  target: string
  startedAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  devicesFound: number
}

export const ScansPage: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    fetch(`${apiUrl}/api/scans`)
      .then(res => res.json())
      .then(res => {
        setScans(res.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <div className="page-header">
        <h2>Scan History</h2>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Spinner size={24} color="var(--primary)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Loading scan history...</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Target</th>
                <th>Devices Found</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => (
                <tr key={scan.id}>
                  <td style={{ color: 'var(--text-main)' }}>
                    {new Date(scan.startedAt).toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{scan.target}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{scan.devicesFound}</td>
                  <td>
                    <Badge 
                      status={scan.status} 
                      isOnline={scan.status === 'completed'} 
                    />
                  </td>
                </tr>
              ))}
              {scans.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                    No scan history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}
