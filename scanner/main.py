import logging
import socket
import json
import asyncio
from typing import Optional

import nmap
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
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


# --- Core Logic ---
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

    async def scan_generator(self, network_range: str):
        """Generador que emite dispositivos encontrados uno por uno."""
        logger.info(f"Streaming discovery on {network_range}")

        # 1. ARP Discovery
        arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=network_range)
        ans, _ = srp(arp_request, timeout=settings.DEFAULT_SCAN_TIMEOUT, verbose=False)

        for _, received in ans:
            device = Device(ip=received.psrc, mac=received.hwsrc)

            # Enriquecimiento rápido (Hostname)
            if self.nm:
                try:
                    # Usamos run_in_executor para no bloquear el loop asíncrono
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(None, lambda: self.nm.scan(device.ip, arguments="-sn"))
                    if device.ip in self.nm.all_hosts():
                        device.hostname = self.nm[device.ip].hostname()
                except Exception as e:
                    logger.warning(f"Enrichment failed for {device.ip}: {e}")

            # Enviamos el dispositivo en formato SSE
            yield f"data: {json.dumps(device.model_dump())}\n\n"
            await asyncio.sleep(0.1)  # Pequeño respiro para el stream

        yield "data: [DONE]\n\n"


# --- API Endpoints ---
app = FastAPI(title=settings.APP_NAME)
scanner = NetworkScanner()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}


@app.get("/scan/stream")
async def run_scan_stream(
    target: Optional[str] = Query(None, description="Network range to scan")
):
    """
    Endpoint de streaming que envía dispositivos conforme se encuentran.
    """
    network_to_scan = target or scanner.get_local_network()
    return StreamingResponse(
        scanner.scan_generator(network_to_scan),
        media_type="text/event-stream"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.SCANNER_PORT)
