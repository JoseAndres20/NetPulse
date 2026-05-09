import { NextResponse } from 'next/server'
import { AppError } from './errors'

// Helper para convertir cualquier error a NextResponse
export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, statusCode: error.statusCode },
      { status: error.statusCode }
    )
  }

  console.error('[Unhandled error]', error)
  return NextResponse.json(
    { error: 'Internal server error', statusCode: 500 },
    { status: 500 }
  )
}

// Validación de IPv4 — valida formato Y rango de octetos (0-255)
export function isValidIp(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = parseInt(p, 10)
    return /^\d+$/.test(p) && n >= 0 && n <= 255
  })
}
