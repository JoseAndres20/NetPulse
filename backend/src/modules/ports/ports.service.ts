import { portsRepository } from './ports.repository'
import type { Port, PortInsertData } from './types'

export const portsService = {
  upsertDevicePorts: async (deviceId: string, scanId: string | null, portsData: PortInsertData[]): Promise<Port[]> => {
    return portsRepository.upsertMany(deviceId, scanId, portsData)
  },

  getPortsByDevice: async (deviceId: string): Promise<Port[]> => {
    return portsRepository.findByDeviceId(deviceId)
  }
}
