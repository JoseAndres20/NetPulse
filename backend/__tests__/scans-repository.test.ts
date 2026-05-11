import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/lib/db', () => ({
  default: {
    query: vi.fn().mockImplementation((query: string) => {
      if (query.includes('INSERT INTO scans')) {
        return Promise.resolve({ rows: [{ id: 'new-scan-id', target: '192.168.1.0/24', status: 'pending' }] })
      }
      if (query.includes('SELECT * FROM scans ORDER BY started_at DESC')) {
        return Promise.resolve({ 
          rows: [
            { id: '1', target: '192.168.1.0/24', status: 'completed', devices_found: 5, started_at: new Date() }
          ],
          rowCount: 1 
        })
      }
      if (query.includes('SELECT COUNT(*)')) {
        return Promise.resolve({ rows: [{ count: '10' }] })
      }
      if (query.includes('UPDATE scans SET status')) {
        return Promise.resolve({ rows: [{ id: '1', status: 'completed' }] })
      }
      if (query.includes('DELETE FROM scans')) {
        return Promise.resolve({ rowCount: 1 })
      }
      return Promise.resolve({ rows: [] })
    })
  }
}))

describe('scansRepository', () => {
  describe('findAll', () => {
    it('should return all scans', async () => {
      const { scansRepository } = await import('../src/modules/scans/scans.repository')
      const result = await scansRepository.findAll()
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })
  })

  describe('create', () => {
    it('should create a new scan', async () => {
      const { scansRepository } = await import('../src/modules/scans/scans.repository')
      const result = await scansRepository.create('192.168.1.0/24', 'full')
      
      expect(result.id).toBe('new-scan-id')
      expect(result.target).toBe('192.168.1.0/24')
    })
  })

  describe('updateStatus', () => {
    it('should update scan status without returning data', async () => {
      const { scansRepository } = await import('../src/modules/scans/scans.repository')
      
      await expect(scansRepository.updateStatus('1', 'completed', 5)).resolves.toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should delete scan and return true', async () => {
      const { scansRepository } = await import('../src/modules/scans/scans.repository')
      const result = await scansRepository.delete('1')
      
      expect(result).toBe(true)
    })
  })
})