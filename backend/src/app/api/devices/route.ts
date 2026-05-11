import { NextRequest, NextResponse } from 'next/server'
import { devicesService } from '@/modules/devices/devices.service'
import { handleError } from '@/lib/http'
import { Validation } from '@/lib/validation'
import { verifyApiKey } from '@/lib/api-key'

export async function GET(req: NextRequest) {
  try {
    verifyApiKey(req)
    const { searchParams } = new URL(req.url)
    const { page, limit } = Validation.validatePaginationParams(
      searchParams.get('page') ?? undefined,
      searchParams.get('limit') ?? undefined
    )

    const { rows, total } = await devicesService.getAll({ page, limit })
    return NextResponse.json({ data: rows, total, page, limit })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    verifyApiKey(req)
    const body = await req.json()
    const validatedData = Validation.validateDeviceInput(body)

    const device = await devicesService.upsertFromScan(validatedData)
    return NextResponse.json({ data: device }, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}