import { devicesRepository } from './devices.repository'
import { AppError } from '@/lib/errors'
import type { Device } from './types'
import type { PaginationParams } from '@/types'

export const devicesService = {

  // getAll: GET /api/devices
  getAll: async (params: PaginationParams) => {
    return devicesRepository.findAll(params)
  },

  // getById: GET /api/devices/:id
  getById: async (id: string): Promise<Device> => {
    const device = await devicesRepository.findById(id)
    if (!device) throw AppError.notFound('Device', id)
    return device
  },

  // getByIp: GET /api/devices/ip/:ip
  getByIp: async (ip: string): Promise<Device> => {
    const device = await devicesRepository.findByIp(ip)
    if (!device) throw AppError.notFound('Device with ip', ip)
    return device
  },

  // upsertFromScan: POST /api/devices
  upsertFromScan: async (device: Partial<Device> & { ip: string }): Promise<Device> => {
    return devicesRepository.upsert(device)
  },

  // markOffline: PATCH /api/devices/:id/status
  markOffline: async (id: string): Promise<Device> => {
    const device = await devicesRepository.updateStatus(id, 'offline')
    if (!device) throw AppError.notFound('Device', id)
    return device
  },

  // remove: DELETE /api/devices/:id
  remove: async (id: string): Promise<void> => {
    const deleted = await devicesRepository.delete(id)
    if (!deleted) throw AppError.notFound('Device', id)
  },
}
