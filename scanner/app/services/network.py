import logging
import socket
import json
import asyncio
import concurrent.futures
import ipaddress
import nmap
from scapy.all import ARP, Ether, srp

from app.core.config import settings
from app.models.device import Device, Port

logger = logging.getLogger(__name__)

DEEP_SCAN_ARGS = "-T4 -F -n -Pn"
DISCOVERY_SCAN_ARGS = "-sn -PE -PR -T4"
MAX_PARALLEL_SCANS = 10


def is_valid_cidr(network: str) -> bool:
    """Validates whether the given string is a valid CIDR notation."""
    try:
        ipaddress.ip_network(network, strict=False)
        return True
    except ValueError:
        return False


async def _scan_host_ports(ip: str) -> Device | None:
    """Performs a fast port scan on a single host and returns a populated Device."""
    try:
        nm = nmap.PortScanner()
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda target=ip: nm.scan(hosts=target, arguments=DEEP_SCAN_ARGS)
        )

        if ip not in nm.all_hosts():
            return None

        host_data = nm[ip]
        mac = host_data.get('addresses', {}).get('mac', '00:00:00:00:00:00')
        device = Device(ip=ip, mac=mac, hostname=host_data.hostname(), status="online")

        for proto in host_data.all_protocols():
            for port_num in host_data[proto].keys():
                port_info = host_data[proto][port_num]
                device.ports.append(Port(
                    port=int(port_num),
                    protocol=proto,
                    state=port_info.get("state", "open"),
                    service=port_info.get("name", ""),
                    version=""
                ))
        return device

    except Exception as e:
        logger.error(f"Port scan failed for {ip}: {e}")
        return None


class NetworkScanner:
    def __init__(self):
        try:
            self.nm = nmap.PortScanner()
        except nmap.PortScannerError:
            logger.error("Nmap not found in system path.")
            self.nm = None
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)

    def __del__(self):
        self.executor.shutdown(wait=False)

    @staticmethod
    def get_local_network() -> str:
        """Detects the local network CIDR by resolving the default outbound interface."""
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            try:
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                detected = ".".join(local_ip.split(".")[:-1]) + ".0/24"
                logger.info(f"Auto-detected network: {detected}")
                return detected
            except Exception as e:
                logger.error(f"Failed to detect local network: {e}")
                return "127.0.0.1/32"

    async def _discover_hosts(self, network_range: str) -> list[str]:
        """Discovers all alive hosts in the network range using Nmap ping scan."""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: self.nm.scan(hosts=network_range, arguments=DISCOVERY_SCAN_ARGS)
        )
        return list(self.nm.all_hosts())

    async def _ping_scan(self, network_range: str):
        """Performs a fast ARP-based discovery scan, streaming each device as found."""
        arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network_range)
        ans, _ = srp(arp_request, timeout=settings.DEFAULT_SCAN_TIMEOUT, verbose=False)

        for _, received in ans:
            device = Device(ip=received.psrc, mac=received.hwsrc)

            if self.nm:
                try:
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(
                        None,
                        lambda ip=device.ip: self.nm.scan(ip, arguments="-sn")
                    )
                    if device.ip in self.nm.all_hosts():
                        device.hostname = self.nm[device.ip].hostname()
                except Exception as e:
                    logger.warning(f"Hostname resolution failed for {device.ip}: {e}")

            yield f"data: {json.dumps(device.model_dump())}\n\n"
            await asyncio.sleep(0.1)

    async def _full_scan(self, network_range: str):
        """
        Performs a two-phase deep scan:
        1. Rapid host discovery — streams devices immediately as they are found.
        2. Parallel port scan — enriches each device with open port data concurrently.
        """
        if not self.nm:
            logger.error("Nmap not available for full scan.")
            return

        logger.info(f"Phase 1: Host discovery on {network_range}")
        alive_ips = await self._discover_hosts(network_range)
        logger.info(f"Found {len(alive_ips)} alive hosts.")

        for ip in alive_ips:
            host_data = self.nm[ip]
            mac = host_data.get('addresses', {}).get('mac', '00:00:00:00:00:00')
            hostname = host_data.hostname() or "Unknown"
            device = Device(ip=ip, mac=mac, hostname=hostname, status="online")
            yield f"data: {json.dumps(device.model_dump())}\n\n"
            await asyncio.sleep(0.01)

        logger.info("Phase 2: Parallel port scan for each host.")
        semaphore = asyncio.Semaphore(MAX_PARALLEL_SCANS)

        async def bounded_scan(ip):
            async with semaphore:
                return await _scan_host_ports(ip)

        tasks = [bounded_scan(ip) for ip in alive_ips]
        for finished in asyncio.as_completed(tasks):
            result = await finished
            if result:
                yield f"data: {json.dumps(result.model_dump())}\n\n"

    async def scan_generator(self, network_range: str, scan_type: str = "ping"):
        """Entry point that routes to the appropriate scan strategy based on scan_type."""
        if not is_valid_cidr(network_range):
            logger.error(f"Invalid CIDR: {network_range}")
            yield "data: [DONE]\n\n"
            return

        logger.info(f"Starting '{scan_type}' scan on {network_range}")

        if scan_type == "ping":
            async for event in self._ping_scan(network_range):
                yield event
        elif scan_type == "full":
            async for event in self._full_scan(network_range):
                yield event

        yield "data: [DONE]\n\n"
