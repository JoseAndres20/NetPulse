import React from 'react'
import { Modal } from '../ui/Modal'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'
import { Server } from 'lucide-react'
import type { Scan, Device } from '../../types'

interface ScanDetailModalProps {
  scan: Scan | null
  devices: Device[]
  loading: boolean
  onClose: () => void
}

export const ScanDetailModal: React.FC<ScanDetailModalProps> = ({ scan, devices, loading, onClose }) => {
  return (
    <Modal 
      isOpen={!!scan} 
      onClose={onClose} 
      title={`Scan Details: ${scan?.target}`}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Spinner size={30} color="var(--primary)" />
        </div>
      ) : devices.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No devices found in this scan.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {devices.map((device) => (
            <div key={device.ip} style={{ 
              backgroundColor: device.is_new ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-main)', 
              border: device.is_new ? '1.5px solid #ef4444' : '1px solid var(--border)',
              boxShadow: device.is_new ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none',
              borderRadius: '8px',
              padding: '1rem',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Server size={18} color={device.is_new ? '#ef4444' : 'var(--primary)'} />
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 600, 
                    color: device.is_new ? '#ef4444' : 'var(--text-main)' 
                  }}>{device.ip}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{device.mac}</span>
                  {device.is_new && (
                    <span className="alert-badge" style={{ backgroundColor: '#ef4444', color: 'white' }}>ALERTA: NUEVO</span>
                  )}
                </div>
                <Badge 
                  status={device.is_new ? 'alert' : device.status} 
                  isOnline={device.status === 'online'} 
                />
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
  )
}
