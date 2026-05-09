import { NextRequest } from 'next/server'
import { devicesController } from '@/modules/devices'

export const GET  = (req: NextRequest) => devicesController.getAll(req)
export const POST = (req: NextRequest) => devicesController.upsert(req)
