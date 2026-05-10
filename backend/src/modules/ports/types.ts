export interface Port {
  id?: number
  device_id: string
  scan_id: string | null
  port: number
  protocol: 'tcp' | 'udp'
  state: 'open' | 'closed' | 'filtered'
  service: string | null
  version: string | null
  detected_at?: string
}

export interface PortInsertData {
  port: number
  protocol: string
  state: string
  service: string | null
  version: string | null
}
