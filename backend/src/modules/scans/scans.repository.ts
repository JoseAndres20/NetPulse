import pool from '@/lib/db'
import { Scan } from './types'

export const scansRepository = {
  // Create a new scan record
  create: async (target: string, scanType: string = 'ping'): Promise<Scan> => {
    const result = await pool.query<Scan>(
      'INSERT INTO scans (target, scan_type, status) VALUES ($1, $2, $3) RETURNING id, started_at as "startedAt", status, target, scan_type as "scanType"',
      [target, scanType, 'running']
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

  findById: async (id: string) => {
    const result = await pool.query('SELECT * FROM scans WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      id: row.id,
      target: row.target,
      scanType: row.scan_type,
      status: row.status,
      devicesFound: row.devices_found,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      errorMsg: row.error_msg
    }
  },

  findPreviousScan: async (target: string, currentScanId: string) => {
    const query = `
      SELECT * FROM scans 
      WHERE target = $1 
      AND id != $2 
      AND status = 'completed'
      AND started_at < (SELECT started_at FROM scans WHERE id = $2)
      ORDER BY started_at DESC 
      LIMIT 1
    `
    const result = await pool.query(query, [target, currentScanId])
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return { id: row.id }
  },

  // Get all scans
  findAll: async () => {
    const result = await pool.query('SELECT * FROM scans ORDER BY started_at DESC')
    return result.rows.map(row => ({
      id: row.id,
      target: row.target,
      scanType: row.scan_type,
      status: row.status,
      devicesFound: row.devices_found,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      errorMsg: row.error_msg
    }))
  },

  linkDeviceToScan: async (scanId: string, deviceId: string) => {
    const query = `
      INSERT INTO scan_devices (scan_id, device_id) 
      VALUES ($1, $2) 
      ON CONFLICT DO NOTHING
    `
    await pool.query(query, [scanId, deviceId])
  },

  getDevicesByScan: async (scanId: string) => {
    const query = `
      SELECT d.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'port', p.port, 
                   'protocol', p.protocol, 
                   'state', p.state, 
                   'service', p.service, 
                   'version', p.version
                 )
               ) FILTER (WHERE p.port IS NOT NULL), '[]'
             ) as ports
      FROM devices d
      JOIN scan_devices sd ON d.id = sd.device_id
      LEFT JOIN ports p ON d.id = p.device_id AND p.scan_id = $1
      WHERE sd.scan_id = $1
      GROUP BY d.id
      ORDER BY d.ip ASC
    `
    const result = await pool.query(query, [scanId])
    return result.rows
  },

  delete: async (id: string): Promise<boolean> => {
    const result = await pool.query('DELETE FROM scans WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  }
}
