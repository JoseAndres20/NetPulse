import { AppError } from './errors'

export const Validation = {
  isValidIp(ip: string): boolean {
    if (!ip || typeof ip !== 'string') return false
    const parts = ip.split('.')
    if (parts.length !== 4) return false
    return parts.every(p => {
      const n = parseInt(p, 10)
      return /^\d+$/.test(p) && n >= 0 && n <= 255
    })
  },

  isValidIpRange(cidr: string): boolean {
    if (!cidr || typeof cidr !== 'string') return false
    const [ip, mask] = cidr.split('/')
    if (!this.isValidIp(ip)) return false
    const maskNum = parseInt(mask, 10)
    return !isNaN(maskNum) && maskNum >= 0 && maskNum <= 32
  },

  isValidMac(mac: string): boolean {
    if (!mac) return true
    if (typeof mac !== 'string') return false
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac)
  },

  sanitizeString(input: string, maxLength = 255): string {
    if (!input || typeof input !== 'string') return ''
    return input.trim().slice(0, maxLength).replace(/[<>]/g, '')
  },

  isValidHostname(hostname: string): boolean {
    if (!hostname) return true
    if (typeof hostname !== 'string') return false
    if (hostname.length > 255) return false
    return /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/.test(hostname)
  },

  isValidPort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535
  },

  validateDeviceInput(data: unknown): {
    ip: string
    mac?: string
    hostname?: string
    vendor?: string
    os?: string
    is_gateway?: boolean
  } {
    if (!data || typeof data !== 'object') {
      throw AppError.badRequest('Invalid request body')
    }

    const obj = data as Record<string, unknown>

    const ipValue = String(obj.ip ?? '')
    if (!ipValue) {
      throw AppError.badRequest('Field "ip" is required')
    }

    if (!this.isValidIp(ipValue)) {
      throw AppError.badRequest(`"${ipValue}" is not a valid IPv4 address`)
    }

    const macValue = obj.mac ? String(obj.mac) : undefined
    if (macValue && !this.isValidMac(macValue)) {
      throw AppError.badRequest(`"${macValue}" is not a valid MAC address`)
    }

    const hostnameValue = obj.hostname ? String(obj.hostname) : undefined
    if (hostnameValue && !this.isValidHostname(hostnameValue)) {
      throw AppError.badRequest(`"${hostnameValue}" is not a valid hostname`)
    }

    return {
      ip: ipValue,
      mac: macValue?.toUpperCase(),
      hostname: hostnameValue ? this.sanitizeString(hostnameValue) : undefined,
      vendor: obj.vendor ? this.sanitizeString(String(obj.vendor), 100) : undefined,
      os: obj.os ? this.sanitizeString(String(obj.os), 50) : undefined,
      is_gateway: typeof obj.is_gateway === 'boolean' ? obj.is_gateway : undefined,
    }
  },

  validatePaginationParams(page?: string, limit?: string): { page: number; limit: number } {
    const pageNum = parseInt(page ?? '1', 10)
    const limitNum = parseInt(limit ?? '50', 10)

    if (isNaN(pageNum) || pageNum < 1) {
      throw AppError.badRequest('Invalid page parameter')
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw AppError.badRequest('Invalid limit parameter (must be between 1 and 100)')
    }

    return { page: pageNum, limit: limitNum }
  }
}