import { NextRequest, NextResponse } from 'next/server'
import { AppError } from './errors'

const API_KEY = process.env.API_KEY || 'dev-api-key'

export function verifyApiKey(req: NextRequest): void {
  const providedKey = req.headers.get('x-api-key')
  
  if (!providedKey) {
    throw AppError.unauthorized('Missing X-API-Key header')
  }
  
  if (providedKey !== API_KEY) {
    throw AppError.forbidden('Invalid API key')
  }
}

export function withApiKey(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      verifyApiKey(req)
      return await handler(req)
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, statusCode: error.statusCode },
          { status: error.statusCode }
        )
      }
      return NextResponse.json(
        { error: 'Internal server error', statusCode: 500 },
        { status: 500 }
      )
    }
  }
}