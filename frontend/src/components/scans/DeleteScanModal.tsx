import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { AlertTriangle } from 'lucide-react'
import type { Scan } from '../../types'

interface DeleteScanModalProps {
  scan: Scan | null
  loading: boolean
  onClose: () => void
  onConfirm: (scan: Scan) => void
}

export const DeleteScanModal: React.FC<DeleteScanModalProps> = ({ scan, loading, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={!!scan}
      onClose={onClose}
      title="Delete Scan"
    >
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <AlertTriangle size={24} color="var(--danger)" />
        </div>
        <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Are you sure you want to delete this scan?
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          Target: <span style={{ fontFamily: 'monospace' }}>{scan?.target}</span>
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          This action cannot be undone.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <Button
          variant="secondary"
          onClick={onClose}
          style={{ flex: 1 }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => scan && onConfirm(scan)}
          disabled={loading}
          style={{ 
            flex: 1, 
            backgroundColor: 'var(--danger)',
            borderColor: 'var(--danger)'
          }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  )
}
