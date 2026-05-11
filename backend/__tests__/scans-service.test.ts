import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scansService } from '../src/modules/scans/scans.service'

vi.mock('../src/modules/scans/scans.repository', () => ({
  scansRepository: {
    create: vi.fn().mockResolvedValue({ id: 'scan-123', target: '192.168.1.0/24', status: 'running' }),
    updateStatus: vi.fn().mockResolvedValue({ id: 'scan-123', status: 'completed', devices_found: 5 }),
    findAll: vi.fn().mockResolvedValue([
      { id: '1', target: '192.168.1.0/24', status: 'completed', devices_found: 5, started_at: new Date() }
    ]),
    linkDeviceToScan: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(true)
  }
}))

vi.mock('../src/modules/devices/devices.service', () => ({
  devicesService: {
    upsertFromScan: vi.fn().mockResolvedValue({ id: 'device-123', ip: '192.168.1.1', status: 'online' })
  }
}))

vi.mock('../src/modules/ports/ports.service', () => ({
  portsService: {
    upsertDevicePorts: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('../src/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}))

describe('scansService', () => {
  describe('getAllScans', () => {
    it('should return all scans', async () => {
      const scans = await scansService.getAllScans()
      expect(scans).toHaveLength(1)
      expect(scans[0].id).toBe('1')
    })
  })

  describe('deleteScan', () => {
    it('should delete scan by id', async () => {
      const result = await scansService.deleteScan('scan-123')
      expect(result).toBe(true)
    })
  })
})