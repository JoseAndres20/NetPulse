import { NextRequest, NextResponse } from 'next/server'
import { scansService } from './scans.service'
import { handleError } from '@/lib/http'

export const scansController = {
  stream: async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(req.url)
      const target = searchParams.get('target')
      const scanType = searchParams.get('scan_type') || 'ping'
      
      const stream = await scansService.startStream(target, scanType)

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      return handleError(error)
    }
  },

  getAll: async (): Promise<NextResponse> => {
    try {
      const scans = await scansService.getAllScans()
      return NextResponse.json({ data: scans })
    } catch (error) {
      return handleError(error)
    }
  },

  getScanDevices: async (_req: NextRequest, id: string): Promise<NextResponse> => {
    try {
      const devices = await scansService.getDevicesByScanWithComparison(id)
      return NextResponse.json({ data: devices })
    } catch (error) {
      return handleError(error)
    }
  }
}
