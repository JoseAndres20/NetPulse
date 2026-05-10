import { scansController } from '@/modules/scans/scans.controller'
import { handleError } from '@/lib/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return scansController.getAll()
  } catch (error) {
    return handleError(error)
  }
}
