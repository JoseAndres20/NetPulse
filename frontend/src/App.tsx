import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { DevicesPage } from './pages/DevicesPage'
import { ScansPage } from './pages/ScansPage'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DevicesPage />} />
          <Route path="/scans" element={<ScansPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
