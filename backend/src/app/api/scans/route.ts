import { scansController } from '@/modules/scans/scans.controller'

export const dynamic = 'force-dynamic'

export async function GET() {
  return scansController.getAll()
}
