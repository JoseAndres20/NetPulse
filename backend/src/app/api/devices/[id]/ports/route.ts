import { NextRequest, NextResponse } from 'next/server'
import { devicesService } from '@/modules/devices/devices.service'
import { portsService } from '@/modules/ports/ports.service'
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
    const ports = await portsService.getPortsByDevice(id)
    return NextResponse.json({ data: { ...device, ports } })
  } catch (error) {
    return handleError(error)
  }
}