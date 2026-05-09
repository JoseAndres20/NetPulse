// Health check — verifica conectividad con la BD
// No forma parte de la arquitectura de módulos (no usa service/repository)
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const start = Date.now()
    await pool.query('SELECT 1')
    const latency = Date.now() - start

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latency_ms: latency,
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', db: 'unreachable', detail: String(error) },
      { status: 503 }
    )
  }
}
