export interface Scan {
  id: string
  target: string
  startedAt: string
  finishedAt?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  devicesFound: number
}

export interface ScanUpdate {
  type: 'device_found' | 'status_update' | 'error'
  data: unknown
}
