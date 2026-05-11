import pytest
import nmap
from unittest.mock import MagicMock, patch
from app.services.network import NetworkScanner, is_valid_cidr


@pytest.fixture
def scanner():
    return NetworkScanner()


def test_is_valid_cidr():
    assert is_valid_cidr("192.168.1.0/24") is True
    assert is_valid_cidr("invalid") is False
    assert is_valid_cidr("10.0.0.1/32") is True


def test_get_local_network_mock():
    with patch("socket.socket") as mock_socket:
        mock_instance = MagicMock()
        mock_instance.getsockname.return_value = ("192.168.1.50", 1234)
        mock_socket.return_value.__enter__.return_value = mock_instance
        network = NetworkScanner.get_local_network()
        assert network == "192.168.1.0/24"


def test_get_local_network_error():
    # Patch socket.socket directly to raise when called
    with patch("socket.socket", side_effect=Exception("No network")):
        network = NetworkScanner.get_local_network()
        assert network == "127.0.0.1/32"


@pytest.mark.asyncio
async def test_discover_hosts_mock(scanner):
    scanner.nm = MagicMock()
    scanner.nm.all_hosts.return_value = ["192.168.1.1", "192.168.1.2"]
    hosts = await scanner._discover_hosts("192.168.1.0/24")
    assert len(hosts) == 2
    assert "192.168.1.1" in hosts


@pytest.mark.asyncio
async def test_ping_scan_generator(scanner):
    # Mocking scapy srp
    with patch("app.services.network.srp") as mock_srp:
        # Mocking an answer with one device
        mock_received = MagicMock()
        mock_received.psrc = "192.168.1.10"
        mock_received.hwsrc = "00:11:22:33:44:55"
        mock_srp.return_value = ([(None, mock_received)], [])
        scanner.nm = None  # Skip hostname lookup for simplicity
        events = []
        async for event in scanner._ping_scan("192.168.1.0/24"):
            events.append(event)
        assert len(events) == 1
        assert "192.168.1.10" in events[0]


@pytest.mark.asyncio
async def test_scan_generator_invalid_cidr(scanner):
    events = []
    async for event in scanner.scan_generator("invalid", "ping"):
        events.append(event)
    assert "data: [DONE]" in events[0]


def test_scanner_init_nmap_error():
    # Use nmap.PortScannerError as expected by the code
    with patch("nmap.PortScanner", side_effect=nmap.PortScannerError("Nmap not found")):
        scanner = NetworkScanner()
        assert scanner.nm is None
        # Verify executor was still created despite nmap error
        assert scanner.executor is not None


@pytest.mark.asyncio
async def test_full_scan_no_nmap(scanner):
    scanner.nm = None
    events = []
    async for event in scanner._full_scan("192.168.1.0/24"):
        events.append(event)
    assert len(events) == 0


@pytest.mark.asyncio
async def test_scan_generator_routing_ping(scanner):
    with patch.object(scanner, '_ping_scan') as mock_ping:
        async def mock_iter():
            yield "data: test\n\n"
        mock_ping.return_value = mock_iter()
        events = []
        async for event in scanner.scan_generator("192.168.1.0/24", "ping"):
            events.append(event)
        assert any("data: test" in str(e) for e in events)
