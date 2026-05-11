import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Device } from '../types'

interface ScanContextType {
  devices: Device[]
  isScanning: boolean
  error: string | null
  startScan: (scanType?: 'ping' | 'full', target?: string) => void
  stopScan: () => void
}

const ScanContext = createContext<ScanContextType | undefined>(undefined)

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [eventSource])

  const stopScan = useCallback(() => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
    setIsScanning(false)
  }, [eventSource])

  const startScan = useCallback((scanType: 'ping' | 'full' = 'full', target?: string) => {
    if (isScanning) return

    if (eventSource) {
      eventSource.close()
    }

    setIsScanning(true)
    setDevices([])
    setError(null)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const url = target 
      ? `${apiUrl}/api/scans/stream?scan_type=${scanType}&target=${encodeURIComponent(target)}`
      : `${apiUrl}/api/scans/stream?scan_type=${scanType}`
    const source = new EventSource(url)
    setEventSource(source)

    source.onmessage = (event) => {
      if (event.data === '[DONE]') {
        source.close()
        setEventSource(null)
        setIsScanning(false)
        return
      }

      try {
        const newDevice: Device = JSON.parse(event.data)
        setDevices(prev => {
          const index = prev.findIndex(d => d.ip === newDevice.ip)
          if (index !== -1) {
            const updated = [...prev]
            updated[index] = newDevice
            return updated
          }
          return [newDevice, ...prev]
        })
      } catch (err) {
        console.error('Error parsing device data:', err)
      }
    }

    source.onerror = () => {
      source.close()
      setEventSource(null)
      setIsScanning(false)
      setError('Connection lost or scanner unreachable.')
    }
  }, [isScanning, eventSource])

  return (
    <ScanContext.Provider value={{ devices, isScanning, error, startScan, stopScan }}>
      {children}
    </ScanContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useScanContext = () => {
  const context = useContext(ScanContext)
  if (context === undefined) {
    throw new Error('useScanContext must be used within a ScanProvider')
  }
  return context
}
