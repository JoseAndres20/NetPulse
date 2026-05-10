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
