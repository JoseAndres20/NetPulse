import React, { useState } from 'react'
import { Play } from 'lucide-react'
import { useScanContext } from '../contexts/ScanContext'
import { ErrorAlert } from '../components/domain/ErrorAlert'
import { DeviceTable } from '../components/domain/DeviceTable'
import { Button } from '../components/ui/Button'

export const DevicesPage: React.FC = () => {
  const { devices, isScanning, error, startScan } = useScanContext()
  const [target, setTarget] = useState('')

  const handleScan = () => {
    const targetValue = target.trim() || undefined
    startScan('full', targetValue)
  }

  return (
    <>
      <div className="page-header">
        <h2>Network Discovery</h2>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="IP range (e.g., 192.168.1.0/24)"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={isScanning}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            width: '300px',
          }}
        />
        <Button 
          onClick={handleScan} 
          isLoading={isScanning}
          loadingText="Scanning..."
        >
          <Play size={18} fill="currentColor" />
          Start Scan
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      <DeviceTable devices={devices} isScanning={isScanning} />
    </>
  )
}
