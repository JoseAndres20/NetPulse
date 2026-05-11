import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { DevicesPage } from './pages/DevicesPage'
import { ScansPage } from './pages/ScansPage'
import { TopologyPage } from './pages/TopologyPage'
import { ThemeProvider } from './contexts/ThemeContext'
import { ScanProvider } from './contexts/ScanContext'

function App() {
  return (
    <ThemeProvider>
      <ScanProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<DevicesPage />} />
              <Route path="/scans" element={<ScansPage />} />
              <Route path="/topology" element={<TopologyPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </ScanProvider>
    </ThemeProvider>
  )
}

export default App
