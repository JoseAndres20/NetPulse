import logging
import socket
import json
import asyncio
import nmap
from scapy.all import ARP, Ether, srp

from app.core.config import settings
from app.models.device import Device, Port

logger = logging.getLogger(__name__)


class NetworkScanner:
    def __init__(self):
        try:
            self.nm = nmap.PortScanner()
        except nmap.PortScannerError:
            logger.error("Nmap not found in system path.")
            self.nm = None

    @staticmethod
    def get_local_network() -> str:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            try:
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                return ".".join(local_ip.split(".")[:-1]) + ".0/24"
            except Exception as e:
                logger.error(f"Failed to detect local network: {e}")
                return "127.0.0.1/32"

    async def scan_generator(self, network_range: str, scan_type: str = "ping"):
        """Generador que emite dispositivos encontrados uno por uno."""
        logger.info(f"Streaming {scan_type} discovery on {network_range}")

        if scan_type == "ping":
            # 1. Escaneo Rápido con ARP (Solo IPs vivas locales)
            arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / \
                ARP(pdst=network_range)
            ans, _ = srp(
                arp_request, timeout=settings.DEFAULT_SCAN_TIMEOUT, verbose=False)

            for _, received in ans:
                device = Device(ip=received.psrc, mac=received.hwsrc)

                # Intentar sacar hostname rápido
                if self.nm:
                    try:
                        loop = asyncio.get_event_loop()
                        await loop.run_in_executor(None, lambda ip=device.ip: self.nm.scan(ip, arguments="-sn"))
                        if device.ip in self.nm.all_hosts():
                            device.hostname = self.nm[device.ip].hostname()
                    except Exception as e:
                        logger.warning(
                            f"Enrichment failed for {device.ip}: {e}")

                yield f"data: {json.dumps(device.model_dump())}\n\n"
                await asyncio.sleep(0.1)

        elif scan_type == "full":
            # 2. Escaneo Profundo a TODA la red usando Nmap directamente
            if not self.nm:
                logger.error("Nmap not available for full scan.")
                yield "data: [DONE]\n\n"
                return

            loop = asyncio.get_event_loop()

            # Ejecutamos el escaneo intensivo a toda la subred en un hilo separado
            nmap_args = "-T4 -F -sV"
            scan_future = loop.run_in_executor(
                None,
                lambda args=nmap_args: self.nm.scan(
                    hosts=network_range, arguments=args)
            )

            # Mientras Nmap escanea, enviamos comentarios SSE (keep-alives)
            # para que el frontend no cierre la conexión por timeout
            while not scan_future.done():
                yield ": keepalive\n\n"
                await asyncio.sleep(2)

            try:
                # Obtenemos el resultado
                await scan_future

                for host in self.nm.all_hosts():
                    host_data = self.nm[host]

                    # Ignorar hosts caídos
                    if host_data.state() != "up":
                        continue

                    # Extraer MAC (Nmap a veces no la detecta si no hay permisos o es remoto)
                    mac = host_data.get('addresses', {}).get(
                        'mac', '00:00:00:00:00:00')
                    device = Device(ip=host, mac=mac,
                                    hostname=host_data.hostname())

                    # Extraer todos los puertos
                    for proto in host_data.all_protocols():
                        for port_num in host_data[proto].keys():
                            port_info = host_data[proto][port_num]
                            device.ports.append(Port(
                                port=int(port_num),
                                protocol=proto,
                                state=port_info.get("state", "open"),
                                service=port_info.get("name", ""),
                                version=port_info.get("version", "")
                            ))

                    yield f"data: {json.dumps(device.model_dump())}\n\n"
            except Exception as e:
                logger.error(f"Full scan execution failed: {e}")

        yield "data: [DONE]\n\n"
