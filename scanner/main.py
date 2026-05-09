import logging
import socket
from typing import List, Optional

import nmap
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from scapy.all import ARP, Ether, srp


# --- Configuration ---
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    APP_NAME: str = "NetPulse Scanner"
    DEBUG: bool = False
    DEFAULT_SCAN_TIMEOUT: int = 3
    SCANNER_PORT: int = 8000


settings = Settings()

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# --- Models ---
class Device(BaseModel):
    ip: str = Field(..., example="192.168.1.1")
    mac: str = Field(..., example="00:11:22:33:44:55")
    hostname: Optional[str] = None
    vendor: Optional[str] = "Unknown"
    status: str = "online"


class ScanResponse(BaseModel):
    network_range: str
    device_count: int
    devices: List[Device]


# --- Core Logic ---
class NetworkScanner:
    """
    Professional Network Discovery Service using Scapy and Nmap.
    """

    def __init__(self):
        try:
            self.nm = nmap.PortScanner()
        except nmap.PortScannerError:
            logger.error("Nmap not found in system path.")
            self.nm = None

    @staticmethod
    def get_local_network() -> str:
        """Determines the local network range in CIDR notation."""
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            try:
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                return ".".join(local_ip.split(".")[:-1]) + ".0/24"
            except Exception as e:
                logger.error(f"Failed to detect local network: {e}")
                return "127.0.0.1/32"

    def scan(self, network_range: str) -> List[Device]:
        """Performs an ARP scan followed by Nmap enrichment."""
        logger.info(f"Initiating discovery on {network_range}")

        # 1. ARP Discovery
        arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network_range)
        ans, _ = srp(arp_request, timeout=settings.DEFAULT_SCAN_TIMEOUT, verbose=False)

        discovered_devices = []
        for _, received in ans:
            device_data = Device(
                ip=received.psrc,
                mac=received.hwsrc
            )
            discovered_devices.append(device_data)

        # 2. Enrichment (Hostnames)
        if self.nm:
            for device in discovered_devices:
                try:
                    self.nm.scan(device.ip, arguments="-sn")  # Ping scan for hostname
                    if device.ip in self.nm.all_hosts():
                        device.hostname = self.nm[device.ip].hostname()
                except Exception as e:
                    logger.warning(f"Failed to enrich {device.ip}: {e}")

        return discovered_devices


# --- API Endpoints ---
app = FastAPI(title=settings.APP_NAME)
scanner = NetworkScanner()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/scan", response_model=ScanResponse)
async def run_scan(
    target: Optional[str] = Query(None, description="Network range to scan (e.g. 192.168.1.0/24)")
):
    """
    Triggers a network scan. If no target is provided, it auto-detects the local network.
    """
    try:
        network_to_scan = target or scanner.get_local_network()
        devices = scanner.scan(network_to_scan)

        return ScanResponse(
            network_range=network_to_scan,
            device_count=len(devices),
            devices=devices
        )
    except Exception as e:
        logger.error(f"Scan operation failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during network scan")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.SCANNER_PORT)
