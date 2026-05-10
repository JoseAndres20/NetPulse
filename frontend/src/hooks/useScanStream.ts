import { useState, useCallback } from 'react'
import type { Device } from '../types'

interface UseScanStreamReturn {
  devices: Device[]
  isScanning: boolean
  error: string | null
  startScan: () => void
  stopScan: () => void
}

export function useScanStream(): UseScanStreamReturn {
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

  const startScan = useCallback(() => {
    // Prevent multiple concurrent scans
    if (isScanning) return

    setIsScanning(true)
    setDevices([])
    setError(null)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const source = new EventSource(`${apiUrl}/api/scans/stream`)
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
      // Solo lanzamos el error si no recibimos el [DONE] antes
      setError('Connection to scanner lost or server is unreachable.')
    }
  }, [isScanning])

  return { devices, isScanning, error, startScan, stopScan }
}
