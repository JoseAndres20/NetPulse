import { scansRepository } from './scans.repository'
import { devicesService } from '../devices/devices.service'
import { portsService } from '../ports/ports.service'

export const scansService = {
  startStream: async (target: string | null, scanType: string = 'ping') => {
    const scannerUrl = new URL(`${process.env.SCANNER_URL || 'http://localhost:8000'}/scan/stream`)
    if (target) scannerUrl.searchParams.append('target', target)
    scannerUrl.searchParams.append('scan_type', scanType)

    const response = await fetch(scannerUrl.toString())
    if (!response.ok) throw new Error('Scanner service unreachable')

    // Registrar inicio del escaneo en DB
    const scanRecord = await scansRepository.create(target || 'auto-detected')
    let foundCount = 0

    const reader = response.body?.getReader()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    return new ReadableStream({
      async start(controller) {
        if (!reader) return controller.close()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith(':')) {
                // Reenviar keepalives o comentarios al frontend para evitar timeout
                controller.enqueue(encoder.encode(`${line}\n\n`))
                continue
              }

              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim()

                if (dataStr === '[DONE]') {
                  // Finalizar registro en DB
                  await scansRepository.updateStatus(scanRecord.id, 'completed', foundCount)
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  continue
                }

                try {
                  const deviceData = JSON.parse(dataStr)
                  foundCount++

                  // Persistir dispositivo
                  devicesService.upsertFromScan(deviceData)
                    .then(async (device) => {
                      await scansRepository.linkDeviceToScan(scanRecord.id, device.id)
                      if (deviceData.ports && deviceData.ports.length > 0) {
                        await portsService.upsertDevicePorts(device.id, scanRecord.id, deviceData.ports)
                      }
                    })
                    .catch(() => { })

                  // Enviar al stream
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(deviceData)}\n\n`))
                } catch { }
              }
            }
          }
        } catch {
          await scansRepository.updateStatus(scanRecord.id, 'failed', foundCount)
        } finally {
          controller.close()
        }
      }
    })
  },

  getAllScans: async () => {
    return scansRepository.findAll()
  }
}
