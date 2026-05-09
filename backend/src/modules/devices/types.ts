// Device type
export interface Device {
  id: string
  ip: string
  mac: string | null
  hostname: string | null
  vendor: string | null
  os: string | null
  status: 'online' | 'offline' | 'unknown'
  is_gateway: boolean
  first_seen: string
  last_seen: string
  created_at: string
}
