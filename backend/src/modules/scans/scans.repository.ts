import pool from '@/lib/db'
import { Scan } from './types'

export const scansRepository = {
  // Create a new scan record
  create: async (target: string): Promise<Scan> => {
    const result = await pool.query<Scan>(
      'INSERT INTO scans (target, status) VALUES ($1, $2) RETURNING id, started_at as "startedAt", status, target',
      [target, 'running']
    )
    return result.rows[0]
  },

  // Update the status of a scan
  updateStatus: async (id: string, status: Scan['status'], devicesFound: number): Promise<void> => {
    await pool.query(
      'UPDATE scans SET status = $1, devices_found = $2, finished_at = NOW() WHERE id = $3',
      [status, devicesFound, id]
    )
  },

  // Get all scans
  findAll: async (): Promise<Scan[]> => {
    const result = await pool.query<Scan>(
      'SELECT id, target, status, devices_found as "devicesFound", started_at as "startedAt", finished_at as "finishedAt" FROM scans ORDER BY started_at DESC'
    )
    return result.rows
  }
}
