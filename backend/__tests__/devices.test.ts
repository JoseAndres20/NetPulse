import { describe, it, expect, vi } from 'vitest'
import { devicesService } from '../src/modules/devices/devices.service'

vi.mock('../src/modules/devices/devices.repository', () => ({
  devicesRepository: {
    findAll: vi.fn().mockResolvedValue({
      rows: [
        { id: '1', ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:FF', status: 'online' }
      ],
      total: 1
    }),
    findById: vi.fn().mockImplementation((id: string) => {
      if (id === 'invalid') return Promise.resolve(null)
      return Promise.resolve({ id: '1', ip: '192.168.1.1', status: 'online' })
    }),
    upsert: vi.fn().mockResolvedValue({ id: 'new-id', ip: '192.168.1.100', status: 'online' }),
    updateStatus: vi.fn().mockResolvedValue({ id: '1', status: 'offline' }),
    delete: vi.fn().mockResolvedValue(true)
  }
}))

describe('devicesService', () => {
  describe('getAll', () => {
    it('should return paginated devices', async () => {
      const result = await devicesService.getAll({ page: 1, limit: 50 })
      expect(result.rows).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe('getById', () => {
    it('should return device by id', async () => {
      const result = await devicesService.getById('1')
      expect(result?.id).toBe('1')
    })

    it('should throw if not found', async () => {
      await expect(devicesService.getById('invalid')).rejects.toThrow()
    })
  })

  describe('upsertFromScan', () => {
    it('should create new device', async () => {
      const result = await devicesService.upsertFromScan({ ip: '192.168.1.100' })
      expect(result.ip).toBe('192.168.1.100')
    })
  })

  describe('markOffline', () => {
    it('should update device status to offline', async () => {
      const result = await devicesService.markOffline('1')
      expect(result.status).toBe('offline')
    })
  })

  describe('remove', () => {
    it('should delete device', async () => {
      await expect(devicesService.remove('1')).resolves.not.toThrow()
    })
  })
})