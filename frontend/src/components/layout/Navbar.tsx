import React from 'react'
import { Bell, Search } from 'lucide-react'

export const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={18} />
        <span style={{ fontSize: '0.9rem' }}>Press / to search</span>
      </div>

      <div className="navbar-user">
        <button className="btn-icon">
          <Bell size={20} />
        </button>
        <div className="avatar">
          AD
        </div>
      </div>
    </header>
  )
}
