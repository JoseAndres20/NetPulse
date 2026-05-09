import { NextRequest } from 'next/server'
import { devicesController } from '@/modules/devices'

export const GET    = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => devicesController.getById(req, id))

export const DELETE = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => devicesController.remove(req, id))
