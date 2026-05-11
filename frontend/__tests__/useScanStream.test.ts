import { describe, it, expect } from 'vitest'

describe('useScanStream', () => {
  it('should export a function', async () => {
    const { useScanStream } = await import('../src/hooks/useScanStream')
    expect(typeof useScanStream).toBe('function')
  })
})