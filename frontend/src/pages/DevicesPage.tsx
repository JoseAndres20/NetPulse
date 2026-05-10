import React from 'react'
import { Play } from 'lucide-react'
import { useScanContext } from '../contexts/ScanContext'
import { ErrorAlert } from '../components/domain/ErrorAlert'
import { DeviceTable } from '../components/domain/DeviceTable'
import { Button } from '../components/ui/Button'

export const DevicesPage: React.FC = () => {
  const { devices, isScanning, error, startScan } = useScanContext()

  return (
    <>
      <div className="page-header">
        <h2>Network Discovery</h2>
        <Button 
          onClick={() => startScan('full')} 
          isLoading={isScanning}
          loadingText="Scanning Network..."
        >
          <Play size={18} fill="currentColor" />
          Full Network Scan
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      <DeviceTable devices={devices} isScanning={isScanning} />
    </>
  )
}
