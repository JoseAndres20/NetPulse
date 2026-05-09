import { NextRequest, NextResponse } from 'next/server'
import { devicesService } from './devices.service'
import { handleError, isValidIp } from '@/lib/http'
import { AppError } from '@/lib/errors'

export const devicesController = {

  // GET /api/devices?page=1&limit=50
  getAll: async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(req.url)
      const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))

      const { rows, total } = await devicesService.getAll({ page, limit })
      return NextResponse.json({ data: rows, total, page, limit })
    } catch (error) {
      return handleError(error)
    }
  },

  // GET /api/devices/:id
  getById: async (_req: NextRequest, id: string): Promise<NextResponse> => {
    try {
      const device = await devicesService.getById(id)
      return NextResponse.json({ data: device })
    } catch (error) {
      return handleError(error)
    }
  },

  // POST /api/devices  { ip, mac?, hostname?, vendor?, os?, status?, is_gateway? }
  upsert: async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json()

      if (!body.ip)           throw AppError.badRequest('Field "ip" is required')
      if (!isValidIp(body.ip)) throw AppError.badRequest(`"${body.ip}" is not a valid IPv4 address`)

      const device = await devicesService.upsertFromScan(body)
      return NextResponse.json({ data: device }, { status: 201 })
    } catch (error) {
      return handleError(error)
    }
  },

  // DELETE /api/devices/:id
  remove: async (_req: NextRequest, id: string): Promise<NextResponse> => {
    try {
      await devicesService.remove(id)
      return NextResponse.json({ ok: true })
    } catch (error) {
      return handleError(error)
    }
  },
}
