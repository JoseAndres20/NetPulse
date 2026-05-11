import pytest
from pydantic import ValidationError
from app.models.device import Device, Port


# --- Port Model Tests ---

def test_port_valid():
    port = Port(port=80, protocol="tcp", state="open", service="http")
    assert port.port == 80
    assert port.protocol == "tcp"
    assert port.state == "open"


def test_port_invalid_types():
    with pytest.raises(ValidationError):
        Port(port="not-a-number", protocol="tcp", state="open")


def test_port_optional_fields():
    port = Port(port=443, protocol="tcp", state="open")
    assert port.service is None
    assert port.version is None


# --- Device Model Tests ---

def test_device_valid():
    device = Device(
        ip="192.168.1.1",
        mac="00:11:22:33:44:55",
        hostname="router.local",
        vendor="Cisco",
        status="online"
    )
    assert device.ip == "192.168.1.1"
    assert device.mac == "00:11:22:33:44:55"


def test_device_default_values():
    device = Device(ip="10.0.0.1", mac="AA:BB:CC:DD:EE:FF")
    assert device.vendor == "Unknown"
    assert device.status == "online"
    assert device.ports == []


def test_device_with_ports():
    ports = [Port(port=80, protocol="tcp", state="open")]
    device = Device(ip="1.1.1.1", mac="11:22:33:44:55:66", ports=ports)
    assert len(device.ports) == 1
    assert device.ports[0].port == 80


def test_device_invalid_ip():
    device = Device(ip="invalid-ip", mac="00:00:00:00:00:00")
    assert device.ip == "invalid-ip"


def test_device_missing_required():
    with pytest.raises(ValidationError):
        Device(ip="1.2.3.4")


def test_device_none_hostname():
    device = Device(ip="1.1.1.1", mac="00:11:22:33:44:55", hostname=None)
    assert device.hostname is None


def test_device_empty_ports_list():
    device = Device(ip="1.1.1.1", mac="00:11:22:33:44:55", ports=[])
    assert device.ports == []
