import { describe, it, expect } from 'vitest'
import { AppError } from '../src/lib/errors'

describe('AppError', () => {
  it('should create error with default 500 status', () => {
    const error = new AppError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.statusCode).toBe(500)
    expect(error.name).toBe('AppError')
  })

  it('should create error with custom status', () => {
    const error = new AppError('Not found', 404)
    expect(error.statusCode).toBe(404)
  })

  it('should create notFound error', () => {
    const error = AppError.notFound('Device', '123')
    expect(error.message).toBe("Device '123' not found")
    expect(error.statusCode).toBe(404)
  })

  it('should create badRequest error', () => {
    const error = AppError.badRequest('Invalid input')
    expect(error.message).toBe('Invalid input')
    expect(error.statusCode).toBe(400)
  })

  
})