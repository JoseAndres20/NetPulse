from typing import Optional
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.services.network import NetworkScanner

router = APIRouter()
scanner = NetworkScanner()


@router.get("/health")
async def health_check():
    return {"status": "healthy"}


@router.get("/scan/stream")
async def run_scan_stream(
    target: Optional[str] = Query(None, description="Network range to scan"),
    scan_type: str = Query(
        "ping", description="Type of scan: 'ping' or 'full'")
):
    """
    Endpoint de streaming que envía dispositivos conforme se encuentran.
    """
    network_to_scan = target or scanner.get_local_network()
    return StreamingResponse(
        scanner.scan_generator(network_to_scan, scan_type=scan_type),
        media_type="text/event-stream"
    )
