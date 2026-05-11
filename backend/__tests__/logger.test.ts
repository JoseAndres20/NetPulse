import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from '../src/lib/logger'

describe('Logger', () => {
  let consoleSpy: { info: ReturnType<typeof vi.spyOn>; warn: ReturnType<typeof vi.spyOn>; error: ReturnType<typeof vi.spyOn> }

  beforeEach(() => {
    consoleSpy = {
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    }
  })

  it('should log info messages', () => {
    logger.info('Test message')
    expect(consoleSpy.info).toHaveBeenCalled()
  })

  it('should log with context', () => {
    logger.info('Test message', { userId: '123', action: 'login' })
    expect(consoleSpy.info).toHaveBeenCalled()
  })

  it('should log errors with context', () => {
    logger.error('Error occurred', { code: '500', details: 'test' })
    expect(consoleSpy.error).toHaveBeenCalled()
  })

  it('should log warnings', () => {
    logger.warn('Warning message', { level: 'high' })
    expect(consoleSpy.warn).toHaveBeenCalled()
  })
})