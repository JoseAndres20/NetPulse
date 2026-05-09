import pool from '@/lib/db'
import type { Device } from './types'
import type { PaginationParams } from '@/types'

export const devicesRepository = {

  // findAll: GET /api/devices
  findAll: async ({ page = 1, limit = 50 }: PaginationParams = {}): Promise<{ rows: Device[]; total: number }> => {
    const offset = (page - 1) * limit
    const [data, count] = await Promise.all([
      pool.query<Device>(
        `SELECT * FROM devices ORDER BY last_seen DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query<{ count: string }>('SELECT COUNT(*) FROM devices'),
    ])
    return { rows: data.rows, total: parseInt(count.rows[0].count) }
  },

  // getbyid: GET /api/devices/:id
  findById: async (id: string): Promise<Device | null> => {
    const result = await pool.query<Device>('SELECT * FROM devices WHERE id = $1', [id])
    return result.rows[0] ?? null
  },

  // findbyip: GET /api/devices/ip/:ip
  findByIp: async (ip: string): Promise<Device | null> => {
    const result = await pool.query<Device>('SELECT * FROM devices WHERE ip = $1', [ip])
    return result.rows[0] ?? null
  },

  // upsert: POST /api/devices
  upsert: async (device: Partial<Device> & { ip: string }): Promise<Device> => {
    const result = await pool.query<Device>(
      `INSERT INTO devices (ip, mac, hostname, vendor, os, status, is_gateway)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (ip) DO UPDATE SET
         mac        = COALESCE(EXCLUDED.mac, devices.mac),
         hostname   = COALESCE(EXCLUDED.hostname, devices.hostname),
         vendor     = COALESCE(EXCLUDED.vendor, devices.vendor),
         os         = COALESCE(EXCLUDED.os, devices.os),
         status     = EXCLUDED.status,
         is_gateway = EXCLUDED.is_gateway,
         last_seen  = NOW()
       RETURNING *`,
      [device.ip, device.mac, device.hostname, device.vendor, device.os, device.status ?? 'unknown', device.is_gateway ?? false]
    )
    return result.rows[0]
  },

  // updatestatus: POST /api/devices/:id/status
  updateStatus: async (id: string, status: Device['status']): Promise<Device | null> => {
    const result = await pool.query<Device>(
      `UPDATE devices SET status = $1, last_seen = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    )
    return result.rows[0] ?? null
  },

  // remove: DELETE /api/devices/:id
  delete: async (id: string): Promise<boolean> => {
    const result = await pool.query('DELETE FROM devices WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
