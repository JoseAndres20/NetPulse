import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Device } from '../types'

interface ScanContextType {
  devices: Device[]
  isScanning: boolean
  error: string | null
  startScan: (scanType?: 'ping' | 'full') => void
  stopScan: () => void
}

const ScanContext = createContext<ScanContextType | undefined>(undefined)

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  const stopScan = useCallback(() => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
    setIsScanning(false)
  }, [eventSource])

  const startScan = useCallback((scanType: 'ping' | 'full' = 'full') => {
    // Prevent multiple concurrent scans
    if (isScanning) return

    setIsScanning(true)
    setDevices([])
    setError(null)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const source = new EventSource(`${apiUrl}/api/scans/stream?scan_type=${scanType}`)
    setEventSource(source)

    source.onmessage = (event) => {
      if (event.data === '[DONE]') {
        source.close() // Cerrar explícitamente en memoria
        setIsScanning(false)
        return
      }

      try {
        const newDevice: Device = JSON.parse(event.data)
        setDevices(prev => {
          if (prev.find(d => d.ip === newDevice.ip)) return prev
          return [newDevice, ...prev]
        })
      } catch (err) {
        console.error('Error parsing device data:', err)
      }
    }

    source.onerror = () => {
      source.close() // Cerrar explícitamente en caso de error real
      setIsScanning(false)
      setError('Connection to scanner lost or server is unreachable.')
    }
  }, [isScanning])

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
