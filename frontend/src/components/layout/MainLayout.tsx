import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="main-wrapper">
        <Navbar />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
