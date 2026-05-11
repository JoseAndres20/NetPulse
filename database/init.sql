CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- devices
CREATE TABLE IF NOT EXISTS devices (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip          VARCHAR(45)  NOT NULL UNIQUE,
    mac         VARCHAR(17),
    hostname    VARCHAR(255),
    vendor      VARCHAR(255),
    os          VARCHAR(255),
    status      VARCHAR(20)  NOT NULL DEFAULT 'unknown'
                CHECK (status IN ('online', 'offline', 'unknown')),
    is_gateway  BOOLEAN      NOT NULL DEFAULT FALSE,
    first_seen  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_seen   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- scans
CREATE TABLE IF NOT EXISTS scans (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target        VARCHAR(100) NOT NULL,
    scan_type     VARCHAR(50)  NOT NULL DEFAULT 'ping',
    status        VARCHAR(20)  NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    devices_found INT          NOT NULL DEFAULT 0,
    started_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    finished_at   TIMESTAMPTZ,
    error_msg     TEXT
);

-- scan_devices (Historial relacional)
CREATE TABLE IF NOT EXISTS scan_devices (
    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    PRIMARY KEY (scan_id, device_id)
);

-- ports
CREATE TABLE IF NOT EXISTS ports (
    id          SERIAL PRIMARY KEY,
    device_id   UUID        NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    scan_id     UUID        REFERENCES scans(id) ON DELETE SET NULL,
    port        INT         NOT NULL CHECK (port BETWEEN 1 AND 65535),
    protocol    VARCHAR(10) NOT NULL DEFAULT 'tcp' CHECK (protocol IN ('tcp', 'udp')),
    state       VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'closed', 'filtered')),
    service     VARCHAR(100),
    version     VARCHAR(255),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (device_id, port, protocol)
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_devices_ip        ON devices (ip);
CREATE INDEX IF NOT EXISTS idx_devices_status    ON devices (status);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices (last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_ports_device_id   ON ports (device_id);
CREATE INDEX IF NOT EXISTS idx_ports_port        ON ports (port);
CREATE INDEX IF NOT EXISTS idx_scans_status      ON scans (status);

