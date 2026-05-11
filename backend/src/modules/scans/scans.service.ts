import { scansRepository } from './scans.repository'
import { devicesService } from '../devices/devices.service'
import type { Device } from '../devices/types'
import { portsService } from '../ports/ports.service'
import { logger } from '@/lib/logger'

const SCANNER_BASE_URL = process.env.SCANNER_URL || 'http://localhost:8000'

/**
 * Persists a discovered device and its open ports to the database,
 * linking it to the active scan record.
 */
async function processDevice(
  deviceData: Record<string, unknown>,
  scanId: string
): Promise<void> {
  try {
    const device = await devicesService.upsertFromScan({
      ip: String(deviceData.ip),
      mac: deviceData.mac ? String(deviceData.mac) : undefined,
      hostname: deviceData.hostname ? String(deviceData.hostname) : undefined,
      vendor: deviceData.vendor ? String(deviceData.vendor) : undefined,
      os: deviceData.os ? String(deviceData.os) : undefined,
      status: deviceData.status
        ? (String(deviceData.status) as 'online' | 'offline' | 'unknown')
        : 'online',
      is_gateway: typeof deviceData.is_gateway === 'boolean' ? deviceData.is_gateway : false,
    })

    await scansRepository.linkDeviceToScan(scanId, device.id)

    if (Array.isArray(deviceData.ports) && deviceData.ports.length > 0) {
      await portsService.upsertDevicePorts(device.id, scanId, deviceData.ports)
    }
  } catch (error) {
    logger.error('Failed to persist device', { ip: deviceData.ip, error: String(error) })
  }
}

export const scansService = {
  /**
   * Opens an SSE stream from the scanner service, proxies events to the client,
   * and asynchronously persists all discovered devices to the database.
   */
  startStream: async (target: string | null, scanType: string = 'ping') => {
    const scannerUrl = new URL(`${SCANNER_BASE_URL}/scan/stream`)
    if (target) scannerUrl.searchParams.append('target', target)
    scannerUrl.searchParams.append('scan_type', scanType)

    const response = await fetch(scannerUrl.toString())
    if (!response.ok) throw new Error('Scanner service unreachable')

    const scanRecord = await scansRepository.create(target || 'auto-detected', scanType)
    const foundIps = new Set<string>()
    let alertsFound = 0

    // Get previous scan for comparison during stream
    const previousScan = await scansRepository.findPreviousScan(target || 'auto-detected', scanRecord.id)
    const previousMacs = new Set<string>()
    const previousIps = new Set<string>()

    if (previousScan) {
      const prevDevices = (await scansRepository.getDevicesByScan(previousScan.id)) as Device[]
      prevDevices.forEach((d: Device) => {
        if (d.mac) previousMacs.add(d.mac)
        previousIps.add(d.ip)
      })
    }

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

            const lines = decoder.decode(value).split('\n')

            for (const line of lines) {
              if (line.startsWith(':')) {
                controller.enqueue(encoder.encode(`${line}\n\n`))
                continue
              }

              if (!line.startsWith('data: ')) continue

              const dataStr = line.replace('data: ', '').trim()

              if (dataStr === '[DONE]') {
                try {
                  await scansRepository.updateStatus(scanRecord.id, 'completed', foundIps.size, alertsFound)
                  logger.info('Scan completed', { scanId: scanRecord.id, devicesFound: foundIps.size, alertsFound })
                } catch (error) {
                  logger.error('Failed to finalize scan', { scanId: scanRecord.id, error: String(error) })
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }

              try {
                const deviceData = JSON.parse(dataStr) as Record<string, unknown>

                if (deviceData.ip) foundIps.add(String(deviceData.ip))

                // Check if device is new for the live stream event
                const isNew = deviceData.mac 
                  ? !previousMacs.has(String(deviceData.mac)) 
                  : !previousIps.has(String(deviceData.ip))
                
                if (isNew && previousScan) {
                  alertsFound++
                  deviceData.is_new = true
                }

                processDevice(deviceData, scanRecord.id).catch((error) =>
                  logger.error('Background persistence failed', { ip: deviceData.ip, error: String(error) })
                )

                controller.enqueue(encoder.encode(`data: ${JSON.stringify(deviceData)}\n\n`))
              } catch (error) {
                logger.warn('Failed to parse device payload', { error: String(error) })
              }
            }
          }
        } catch (error) {
          logger.error('Stream read error', { scanId: scanRecord.id, error: String(error) })
          await scansRepository.updateStatus(scanRecord.id, 'failed', foundIps.size, alertsFound)
        } finally {
          controller.close()
        }
      }
    })
  },

  /** Returns all historical scan records ordered by most recent. */
  getAllScans: async () => {
    return scansRepository.findAll()
  },

  /** Deletes a scan record and its associated device links by ID. */
  deleteScan: async (id: string) => {
    return scansRepository.delete(id)
  },

  /**
   * Retrieves devices for a scan and compares them with the previous scan
   * to mark which ones are newly discovered.
   */
  getDevicesByScanWithComparison: async (scanId: string) => {
    const currentScan = await scansRepository.findById(scanId)
    if (!currentScan) throw new Error('Scan not found')

    const currentDevices = await scansRepository.getDevicesByScan(scanId)
    const previousScan = await scansRepository.findPreviousScan(currentScan.target, scanId)

    if (!previousScan) {
      // If no previous scan, all devices are considered "known" (or new, but no comparison base)
      return currentDevices.map((d: Device) => ({ ...d, is_new: false }))
    }

    const previousDevices = (await scansRepository.getDevicesByScan(previousScan.id)) as Device[]
    
    // Create sets for fast lookup
    const previousMacs = new Set(
      previousDevices
        .map((d: Device) => d.mac?.toLowerCase())
        .filter(Boolean)
    )
    const previousIps = new Set(
      previousDevices.map((d: Device) => d.ip)
    )

    return currentDevices.map((d: Device) => {
      const currentMac = d.mac?.toLowerCase()
      const currentIp = d.ip

      // A device is new if its MAC wasn't in the previous scan.
      // If MAC is missing, fallback to IP comparison.
      let isNew = false
      if (currentMac) {
        isNew = !previousMacs.has(currentMac)
      } else {
        isNew = !previousIps.has(currentIp)
      }

      return {
        ...d,
        is_new: isNew
      }
    })
  }
}
