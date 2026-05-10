import React from 'react'
import { Sun, Moon, Menu, Radar } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useScanContext } from '../../contexts/ScanContext'

interface NavbarProps {
  onMenuClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme()
  const { isScanning } = useScanContext()

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-icon mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
      </div>

      <div className="navbar-user">
        {isScanning && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            color: 'var(--primary)', fontWeight: 500, fontSize: '0.85rem',
            backgroundColor: 'var(--bg-surface)', padding: '6px 12px',
            borderRadius: '20px', border: '1px solid var(--primary)'
          }}>
            <Radar size={16} className="pulsing-icon" />
            <span className="desktop-only">Scanning Network...</span>
          </div>
        )}
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="radar-avatar" title="System Scanning"></div>
      </div>
    </header>
  )
}
