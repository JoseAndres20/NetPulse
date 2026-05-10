import { NextRequest } from 'next/server'
import { scansController } from '@/modules/scans/scans.controller'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const id = params?.id
  return scansController.getScanDevices(req, id)
}
