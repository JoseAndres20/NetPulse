import React from 'react'
import { Play } from 'lucide-react'
import { useScanStream } from '../hooks/useScanStream'
import { ErrorAlert } from '../components/domain/ErrorAlert'
import { DeviceTable } from '../components/domain/DeviceTable'
import { Button } from '../components/ui/Button'

export const DevicesPage: React.FC = () => {
  const { devices, isScanning, error, startScan } = useScanStream()

  return (
    <>
      <div className="page-header">
        <h2>Network Devices</h2>
        <Button 
          onClick={startScan} 
          isLoading={isScanning}
          loadingText="Scanning Network..."
        >
          <Play size={18} fill="currentColor" />
          Start Discovery
        </Button>
      </div>

      {error && <ErrorAlert message={error} />}

      <DeviceTable devices={devices} isScanning={isScanning} />
    </>
  )
}
