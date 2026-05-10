from typing import Optional, List
from pydantic import BaseModel, Field


class Port(BaseModel):
    port: int
    protocol: str
    state: str
    service: Optional[str] = None
    version: Optional[str] = None


class Device(BaseModel):
    ip: str = Field(..., example="192.168.1.1")
    mac: str = Field(..., example="00:11:22:33:44:55")
    hostname: Optional[str] = None
    vendor: Optional[str] = "Unknown"
    status: str = "online"
    ports: List[Port] = Field(default_factory=list)
