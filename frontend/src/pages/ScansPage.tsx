import React, { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Server } from 'lucide-react'
import type { Device } from '../types'

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
  
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const [scanDevices, setScanDevices] = useState<Device[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const totalPages = Math.ceil(scans.length / itemsPerPage)
  const currentScans = scans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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

  const handleScanClick = async (scan: Scan) => {
    setSelectedScan(scan)
    setLoadingDetails(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const res = await fetch(`${apiUrl}/api/scans/${scan.id}/devices`)
      const json = await res.json()
      setScanDevices(json.data || [])
    } catch (err) {
      console.error('Failed to fetch scan details', err)
    } finally {
      setLoadingDetails(false)
    }
  }

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
          <div className="table-container">
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
                {currentScans.map((scan) => (
                  <tr 
                    key={scan.id} 
                    className="new-row" 
                    onClick={() => handleScanClick(scan)}
                    style={{ cursor: 'pointer' }}
                  >
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
                {currentScans.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
                      No scan history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem', padding: '0 1.5rem 1.5rem 1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button 
                    variant="secondary" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal 
        isOpen={!!selectedScan} 
        onClose={() => setSelectedScan(null)} 
        title={`Scan Details: ${selectedScan?.target}`}
      >
        {loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Spinner size={30} color="var(--primary)" />
          </div>
        ) : scanDevices.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No devices found in this scan.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {scanDevices.map((device) => (
              <div key={device.ip} style={{ 
                backgroundColor: 'var(--bg-main)', 
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Server size={18} color="var(--primary)" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{device.ip}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{device.mac}</span>
                  </div>
                  <Badge status={device.status} isOnline={device.status === 'online'} />
                </div>
                
                {device.hostname && (
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                    Hostname: {device.hostname} | Vendor: {device.vendor || 'Unknown'}
                  </p>
                )}

                {device.ports && device.ports.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {device.ports.map((p, idx) => (
                      <div key={idx} style={{
                        backgroundColor: p.state === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface-hover)',
                        border: '1px solid',
                        borderColor: p.state === 'open' ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                        color: p.state === 'open' ? 'var(--success)' : 'var(--text-dim)'
                      }}>
                        <b>{p.port}/{p.protocol}</b> {p.service} {p.version}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}
