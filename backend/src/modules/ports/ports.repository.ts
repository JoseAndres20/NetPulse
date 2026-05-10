import pool from '@/lib/db'
import type { Port, PortInsertData } from './types'

export const portsRepository = {
  // Guarda múltiples puertos en bloque (Upsert)
  upsertMany: async (deviceId: string, scanId: string | null, portsData: PortInsertData[]): Promise<Port[]> => {
    if (portsData.length === 0) return []

    const client = await pool.connect()
    try {
      const insertedPorts: Port[] = []
      
      for (const portInfo of portsData) {
        const query = `
          INSERT INTO ports (device_id, scan_id, port, protocol, state, service, version)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (device_id, port, protocol) 
          DO UPDATE SET 
            scan_id = EXCLUDED.scan_id,
            state = EXCLUDED.state,
            service = EXCLUDED.service,
            version = EXCLUDED.version,
            detected_at = NOW()
          RETURNING *;
        `
        const values = [
          deviceId,
          scanId,
          portInfo.port,
          portInfo.protocol,
          portInfo.state,
          portInfo.service,
          portInfo.version
        ]

        const result = await client.query(query, values)
        if (result.rows[0]) {
          insertedPorts.push(result.rows[0] as Port)
        }
      }
      return insertedPorts
    } finally {
      client.release()
    }
  },

  // Consulta los puertos de un dispositivo
  findByDeviceId: async (deviceId: string): Promise<Port[]> => {
    const query = `
      SELECT * FROM ports 
      WHERE device_id = $1 
      ORDER BY port ASC
    `
    const result = await pool.query(query, [deviceId])
    return result.rows as Port[]
  }
}
