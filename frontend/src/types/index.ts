export interface Port {
  port: number
  protocol: string
  state: string
  service?: string
  version?: string
}

export interface Device {
  ip: string
  mac: string
  hostname?: string
  vendor?: string
  status: string
  ports?: Port[]
}

export interface Scan {
  id: string
  target: string
  startedAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  devicesFound: number
}
