import React, { useEffect } from 'react'
import { Monitor, Radar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (val: boolean) => void
  mobileOpen?: boolean
  setMobileOpen?: (val: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  setCollapsed, 
  mobileOpen, 
  setMobileOpen 
}) => {
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <>
      {mobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Radar size={28} color="var(--primary)" />
            <span>NetPulse</span>
          </div>
          <button className="btn-icon desktop-only" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          {mobileOpen && setMobileOpen && (
            <button className="btn-icon mobile-only" onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Monitor size={20} />
            <span>Devices</span>
          </NavLink>

          <NavLink to="/scans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Radar size={20} />
            <span>Scans</span>
          </NavLink>
        </nav>
      </aside>
    </>
  )
}
