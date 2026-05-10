import { NextRequest } from 'next/server'
import { scansController } from '@/modules/scans/scans.controller'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return scansController.stream(req)
}
