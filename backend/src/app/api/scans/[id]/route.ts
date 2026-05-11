import { NextRequest, NextResponse } from 'next/server'
import { scansService } from '@/modules/scans/scans.service'
import { handleError } from '@/lib/http'
import { verifyApiKey } from '@/lib/api-key'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyApiKey(req)
    const { id } = await params
    await scansService.deleteScan(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleError(error)
  }
}