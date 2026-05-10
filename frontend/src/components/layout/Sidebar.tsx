import React from 'react'
import { Monitor, Radar, ShieldAlert, Settings, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (val: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Activity size={28} color="var(--primary)" />
          <span>NetPulse</span>
        </div>
        <button className="btn-icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
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
        
        <div className="nav-item">
          <ShieldAlert size={20} />
          <span>Vulnerabilities</span>
        </div>
        
        <div style={{ flex: 1 }}></div>

        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </nav>
    </aside>
  )
}
