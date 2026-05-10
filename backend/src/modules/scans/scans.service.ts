import { scansRepository } from './scans.repository'
import { devicesService } from '../devices/devices.service'

export const scansService = {
  startStream: async (target: string | null) => {
    const scannerUrl = `${process.env.SCANNER_URL || 'http://localhost:8000'}/scan/stream${target ? `?target=${target}` : ''}`
    
    const response = await fetch(scannerUrl)
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
                  devicesService.upsertFromScan(deviceData).catch(e => console.error(e))

                  // Enviar al stream
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(deviceData)}\n\n`))
                } catch {}
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
