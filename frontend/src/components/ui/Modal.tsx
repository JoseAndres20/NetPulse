import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{title}</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-dim)',
              cursor: 'pointer', padding: '0.25rem', display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
