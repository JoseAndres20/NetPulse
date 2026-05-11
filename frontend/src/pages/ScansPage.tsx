import React, { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { apiClient, ApiError } from '../lib/api-client'
import { ErrorAlert } from '../components/domain/ErrorAlert'
import { ScanTable } from '../components/scans/ScanTable'
import { ScanDetailModal } from '../components/scans/ScanDetailModal'
import { DeleteScanModal } from '../components/scans/DeleteScanModal'
import type { Device, Scan } from '../types'

export const ScansPage: React.FC = () => {
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null)
  const [scanDevices, setScanDevices] = useState<Device[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState<Scan | null>(null)

  const fetchScans = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    apiClient.get(`${apiUrl}/api/scans`)
      .then(res => res.json())
      .then(res => {
        setScans(res.data || [])
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.isNetworkError) {
          setError('Backend not running. Run: make up')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load scans')
        }
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchScans()
  }, [])

  const handleScanClick = async (scan: Scan) => {
    setSelectedScan(scan)
    setLoadingDetails(true)
    setScanDevices([])
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const res = await apiClient.get(`${apiUrl}/api/scans/${scan.id}/devices`)
      const json = await res.json()
      setScanDevices(json.data || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load devices'
      setError(message)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleDelete = async (scan: Scan) => {
    setDeleteLoading(scan.id)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      await apiClient.delete(`${apiUrl}/api/scans/${scan.id}`)
      setScans(prev => prev.filter(s => s.id !== scan.id))
      setShowDeleteModal(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete scan')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Scan History</h2>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Spinner size={24} color="var(--primary)" />
            <p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Loading scan history...</p>
          </div>
        ) : (
          <ScanTable 
            scans={scans} 
            onScanClick={handleScanClick} 
            onDeleteClick={setShowDeleteModal} 
          />
        )}
      </Card>

      <ScanDetailModal 
        scan={selectedScan}
        devices={scanDevices}
        loading={loadingDetails}
        onClose={() => setSelectedScan(null)}
      />

      <DeleteScanModal 
        scan={showDeleteModal}
        loading={!!deleteLoading}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
