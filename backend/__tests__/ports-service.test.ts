import { describe, it, expect, vi } from 'vitest'
import { portsService } from '../src/modules/ports/ports.service'

vi.mock('../src/modules/ports/ports.repository', () => ({
  portsRepository: {
    upsertMany: vi.fn().mockImplementation((deviceId, scanId, ports) => {
      return Promise.resolve(ports.map((p: { port: number; protocol: string }) => ({
        id: 1,
        device_id: deviceId,
        scan_id: scanId,
        port: p.port,
        protocol: p.protocol,
        state: 'open',
        service: 'http',
        version: '',
        detected_at: new Date()
      })))
    }),
    findByDeviceId: vi.fn().mockResolvedValue([
      { id: 1, device_id: 'device-1', port: 80, protocol: 'tcp', state: 'open', service: 'http' },
      { id: 2, device_id: 'device-1', port: 443, protocol: 'tcp', state: 'open', service: 'https' }
    ])
  }
}))

describe('portsService', () => {
  describe('upsertDevicePorts', () => {
    it('should upsert multiple ports for a device', async () => {
      const portsData = [
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: null },
        { port: 443, protocol: 'tcp', state: 'open', service: 'https', version: null }
      ]
      
      const result = await portsService.upsertDevicePorts('device-123', 'scan-456', portsData)
      
      expect(result).toHaveLength(2)
      expect(result[0].port).toBe(80)
      expect(result[1].port).toBe(443)
    })

    it('should handle empty ports array', async () => {
      const result = await portsService.upsertDevicePorts('device-123', 'scan-456', [])
      expect(result).toHaveLength(0)
    })
  })

  describe('getPortsByDevice', () => {
    it('should return all ports for a device', async () => {
      const ports = await portsService.getPortsByDevice('device-1')
      
      expect(ports).toHaveLength(2)
      expect(ports[0].port).toBe(80)
      expect(ports[1].port).toBe(443)
    })
  })
})