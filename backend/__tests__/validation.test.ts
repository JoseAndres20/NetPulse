import { describe, it, expect } from 'vitest'
import { Validation } from '../src/lib/validation'
import { AppError } from '../src/lib/errors'

describe('Validation', () => {
  describe('isValidIp', () => {
    it('should accept valid IPv4 addresses', () => {
      expect(Validation.isValidIp('192.168.1.1')).toBe(true)
      expect(Validation.isValidIp('10.0.0.1')).toBe(true)
      expect(Validation.isValidIp('0.0.0.0')).toBe(true)
      expect(Validation.isValidIp('255.255.255.255')).toBe(true)
    })

    it('should reject invalid IPv4 addresses', () => {
      expect(Validation.isValidIp('256.1.1.1')).toBe(false)
      expect(Validation.isValidIp('192.168.1')).toBe(false)
      expect(Validation.isValidIp('192.168.1.1.1')).toBe(false)
      expect(Validation.isValidIp('abc.def.ghi.jkl')).toBe(false)
      expect(Validation.isValidIp('')).toBe(false)
    })
  })

  describe('isValidMac', () => {
    it('should accept valid MAC addresses', () => {
      expect(Validation.isValidMac('A4:C3:F0:01:23:45')).toBe(true)
      expect(Validation.isValidMac('a4:c3:f0:01:23:45')).toBe(true)
      expect(Validation.isValidMac('A4-C3-F0-01-23-45')).toBe(true)
      expect(Validation.isValidMac('')).toBe(true)
    })

    it('should reject invalid MAC addresses', () => {
      expect(Validation.isValidMac('A4:C3:F0:01:23')).toBe(false)
      expect(Validation.isValidMac('invalid')).toBe(false)
    })
  })

  describe('validateDeviceInput', () => {
    it('should validate correct device input', () => {
      const input = {
        ip: '192.168.1.100',
        mac: 'A4:C3:F0:01:23:45',
        hostname: 'test-device',
        vendor: 'TestCorp',
        os: 'Linux'
      }
      const result = Validation.validateDeviceInput(input)
      expect(result.ip).toBe('192.168.1.100')
      expect(result.mac).toBe('A4:C3:F0:01:23:45')
    })

    it('should throw on missing IP', () => {
      expect(() => Validation.validateDeviceInput({})).toThrow(AppError)
    })

    it('should throw on invalid IP', () => {
      expect(() => Validation.validateDeviceInput({ ip: '999.999.999.999' })).toThrow(AppError)
    })

    it('should sanitize strings', () => {
      const input = { ip: '192.168.1.1', hostname: 'test-device', vendor: '  Vendor  ' }
      const result = Validation.validateDeviceInput(input)
      expect(result.hostname).toBe('test-device')
      expect(result.vendor).toBe('Vendor')
    })
  })

  describe('validatePaginationParams', () => {
    it('should parse valid pagination params', () => {
      expect(Validation.validatePaginationParams('1', '50')).toEqual({ page: 1, limit: 50 })
      expect(Validation.validatePaginationParams('2', '10')).toEqual({ page: 2, limit: 10 })
    })

    it('should use defaults for missing params', () => {
      expect(Validation.validatePaginationParams(undefined, undefined)).toEqual({ page: 1, limit: 50 })
    })

    it('should throw on invalid params', () => {
      expect(() => Validation.validatePaginationParams('0', '50')).toThrow(AppError)
      expect(() => Validation.validatePaginationParams('1', '200')).toThrow(AppError)
    })
  })
})