-- Genlogs Schema v1.0
-- Optimized for OLAP queries on PostgreSQL

-- Carriers Master Data (Internal Domain Model)
CREATE TABLE IF NOT EXISTS carriers (
    id SERIAL PRIMARY KEY,
    usdot_number INT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by USDOT
CREATE INDEX IF NOT EXISTS idx_carriers_usdot ON carriers(usdot_number);

-- Truck Detections Log (Fact Table)
CREATE TABLE IF NOT EXISTS truck_detections (
    id SERIAL PRIMARY KEY,
    truck_id VARCHAR(50) NOT NULL, -- Simulated from Plate/VIN
    carrier_id INT REFERENCES carriers(id),
    origin_city VARCHAR(100) NOT NULL,
    dest_city VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for route filtering
CREATE INDEX IF NOT EXISTS idx_detections_route ON truck_detections(origin_city, dest_city);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON truck_detections(timestamp);

-- Materialized View for Route Analytics
-- This simulates our OLAP tier (ClickHouse/BigQuery) within PostgreSQL
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_route_carrier_stats AS
SELECT 
    origin_city, 
    dest_city, 
    c.name as carrier_name, 
    COUNT(DISTINCT td.truck_id) as trucks_per_day,
    MAX(td.timestamp) as last_updated
FROM truck_detections td
JOIN carriers c ON td.carrier_id = c.id
-- In a real scenario, we would filter by a time window (e.g., last 24h)
-- WHERE td.timestamp > CURRENT_DATE - INTERVAL '1 day'
GROUP BY origin_city, dest_city, c.name;

-- Unique index on Materialized View for concurrent refreshes and fast reads
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_route_carrier ON mv_route_carrier_stats (origin_city, dest_city, carrier_name);

-- Edge Device Management
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    location_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active'
);

-- Raw Image Ingestion
CREATE TABLE IF NOT EXISTS detections_raw (
    id SERIAL PRIMARY KEY,
    camera_id INT REFERENCES cameras(id),
    s3_path TEXT NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Processing Results
CREATE TABLE IF NOT EXISTS ocr_results (
    id SERIAL PRIMARY KEY,
    detection_id INT REFERENCES detections_raw(id),
    detected_text VARCHAR(255),
    logo_label VARCHAR(100),
    confidence FLOAT,
    bounding_box JSONB
);

-- Domain Entity Resolution
CREATE TABLE IF NOT EXISTS truck_identifications (
    id SERIAL PRIMARY KEY,
    detection_id INT REFERENCES detections_raw(id),
    carrier_id INT REFERENCES carriers(id),
    confidence_score FLOAT
);
