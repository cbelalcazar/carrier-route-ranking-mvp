# Genlogs System Architecture Diagrams

This document provides the architectural visual mapping for the Genlogs Carrier Portal, following the **C4 Model** and **Entity-Relationship** standards.

---

## 1. System Context Diagram (C4 Level 1)

This high-level view shows how Genlogs interacts with external actors and government systems.

```mermaid
graph TB
    User[Logistics Manager / User]
    
    subgraph Genlogs_Platform [Genlogs Platform]
        System[Carrier Portal & Analytics Engine]
    end

    subgraph External_Systems [External Ecosystem]
        Cameras[Highway Cameras / Edge AI]
        GovAPI[FMCSA/USDOT Federal Registries]
    end

    User -- "Analyzes carrier performance" --> System
    Cameras -- "Uploads detections (Plates/Logos)" --> System
    GovAPI -- "Provides carrier metadata (Bulk Dumps)" --> System
    
    style Genlogs_Platform fill:#1168bd,color:#fff,stroke:#0b4884
    style User fill:#08427b,color:#fff
    style External_Systems fill:#eee,stroke:#999
```

---

## 2. Container Diagram (C4 Level 2)

### 2.1 Target Production Architecture (National Scale)
Designed for millions of events/day and sub-second analytical latency.

```mermaid
graph LR
    subgraph Edge [Edge Tier]
        AI[YOLOv8 Edge Nodes]
    end

    subgraph Ingestion [Ingestion & Processing]
        S3[(Object Storage)]
        Kafka{Kafka Message Bus}
        OCR[OCR/Logo Workers]
        Flink[Flink Stream Processor]
    end

    subgraph Storage [Analytical Tier]
        CH[(ClickHouse OLAP)]
        Redis[(Redis Cache - ACL)]
    end

    subgraph API [Serving Tier]
        FastAPI[FastAPI Backend]
        React[React Frontend]
    end

    AI -- "Presigned Upload" --> S3
    S3 -- "ObjectCreated Event" --> Kafka
    Kafka -- "Raw Event" --> OCR
    OCR -- "Enriched Event" --> Kafka
    Kafka -- "Aggregation" --> Flink
    Flink -- "Batch Writes" --> CH
    Redis -- "High Speed ACL Lookup" --> OCR
    CH -- "Sub-second Analytics" --> FastAPI
    FastAPI -- "JSON API" --> React
    
    style Kafka fill:#f96,stroke:#333
    style CH fill:#ff3,stroke:#333
```

### 2.2 MVP Architecture (Current Prototype)
The pragmatically containerized implementation for this exercise.

```mermaid
graph TB
    subgraph Docker_Compose [Docker Compose Stack]
        Frontend[React / Vite]
        Backend[FastAPI]
        DB[(PostgreSQL 15)]
        ETL[Python Seed/ETL]
    end

    CSV[raw_carriers.csv]

    CSV -- "Ingestion" --> ETL
    ETL -- "Cleanup & Normalization" --> DB
    Backend -- "SQL Queries / MV Access" --> DB
    Frontend -- "HTTP/JSON" --> Backend
    
    style Docker_Compose fill:#f5f5f5,stroke:#333,stroke-dasharray: 5 5
    style DB fill:#336791,color:#fff
```

---

## 3. Database ER Diagram

The database is optimized using an **Analytical Tier** within PostgreSQL via **Materialized Views**. The full platform also tracks the source and processing tiers.

```mermaid
erDiagram
    CAMERAS ||--o{ DETECTIONS_RAW : captures
    DETECTIONS_RAW ||--o{ OCR_RESULTS : generates
    OCR_RESULTS ||--|| TRUCK_IDENTIFICATIONS : identifies
    TRUCK_IDENTIFICATIONS }o--|| CARRIERS : matches
    TRUCK_IDENTIFICATIONS ||--|| TRUCK_DETECTIONS : populates
    
    CAMERAS {
        int id PK
        string serial_number
        float lat
        float lng
        string status
    }
    DETECTIONS_RAW {
        int id PK
        int camera_id FK
        string s3_path
        timestamp captured_at
    }
    OCR_RESULTS {
        int id PK
        int detection_id FK
        string detected_text
        string logo_label
        float confidence
        jsonb bounding_box
    }
    CARRIERS {
        int id PK
        int usdot_number UK
        string name
    }
    TRUCK_DETECTIONS {
        int id PK
        int carrier_id FK
        string origin_city
        string dest_city
        timestamp timestamp
    }
    MV_ROUTE_CARRIER_STATS ||--|| CARRIERS : aggregates
    MV_ROUTE_CARRIER_STATS {
        string origin_city
        string dest_city
        string carrier_name
        int trucks_per_day
        timestamp last_updated
    }
```

---

## 4. Key Architectural Decisions

1.  **Anti-Corruption Layer (ACL):** The `seed.py` process acts as the ACL, ensuring that raw, noisy data from external sources is normalized before entering our domain.
2.  **OLAP Simulation:** We use a **Materialized View** (`mv_route_carrier_stats`) to pre-calculate carrier rankings. This avoids expensive `COUNT(DISTINCT)` joins on large datasets during user requests.
3.  **Zero-Trust Sanitization:** All user inputs (Origin/Destination) are sanitized via regex and normalized to lowercase to prevent injection and ensure cache hits.
