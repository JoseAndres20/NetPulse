import { NextRequest, NextResponse } from 'next/server'
import { devicesService } from '@/modules/devices/devices.service'
import { handleError } from '@/lib/http'
import { verifyApiKey } from '@/lib/api-key'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyApiKey(req)
    const { id } = await params
    const device = await devicesService.getById(id)
    return NextResponse.json({ data: device })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyApiKey(req)
    const { id } = await params
    await devicesService.remove(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleError(error)
  }
}