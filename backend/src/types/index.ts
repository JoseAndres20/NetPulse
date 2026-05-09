// Tipos compartidos entre módulos
export type { Device } from '@/modules/devices/types'

export interface Scan {
  id: string
  target: string
  scan_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  devices_found: number
  started_at: string
  finished_at: string | null
  error_msg: string | null
}

export interface Alert {
  id: string
  device_id: string | null
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  type: string
  title: string
  description: string | null
  is_read: boolean
  created_at: string
}

export interface Port {
  id: number
  device_id: string
  scan_id: string | null
  port: number
  protocol: 'tcp' | 'udp'
  state: 'open' | 'closed' | 'filtered'
  service: string | null
  version: string | null
  detected_at: string
}

export interface Vulnerability {
  id: string
  device_id: string
  port_id: number | null
  cve_id: string | null
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string | null
  solution: string | null
  detected_at: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface ApiResponse<T> {
  data: T
  total?: number
  page?: number
}
