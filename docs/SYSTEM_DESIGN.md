# Genlogs Platform: High-Scale Systems Architecture (v4.0)

## 1. Executive Summary & Design Philosophy

This document outlines the target architecture for the Genlogs national truck tracking platform. The system is designed for **99.999% availability**, **cost-optimized edge ingestion**, and **zero-trust security**.

**Core Mandate:** Never place an uncontrollable external dependency (like government APIs) in the critical path of high-speed processing.

---

## 2. Architecture & Modules

To design a highly available and scalable platform capable of tracking millions of trucks, I would implement an event-driven, hybrid edge-cloud architecture divided into four distinct tiers:

### 2.1. Edge & Ingestion Tier

- **Edge AI Nodes:** Cameras act as edge nodes running lightweight object detection (e.g., YOLO-v8 tiny) to crop regions of interest (plates, logos) before transmission. This saves massive bandwidth.
- **IoT Control Plane:** Manages camera fleets, OTA updates, and health monitoring (e.g., AWS IoT Core).
- **Data Plane (Object Storage):** Images are uploaded directly to Object Storage (e.g., S3) via Presigned URLs to ensure horizontal scalability without API Gateway bottlenecks.

### 2.2. Processing Pipeline (Event-Driven)

- **Message Broker:** Kafka or Kinesis acts as the central nervous system, decoupling ingestion from processing.
- **Image Routing Service:** Consumes upload events and triggers parallel asynchronous microservices.
- **OCR & Logo Microservices:** GPU-accelerated workers that extract text (plates/USDOT) and classify company logos from the cropped images.

### 2.3. Enrichment & Anti-Corruption Layer (ACL)

- **Batch-to-Stream ETL:** Instead of synchronously querying government APIs (USDOT/FMCSA) which are prone to rate-limits, a nightly ETL process downloads federal dumps.
- **ACL Microservice:** Transforms legacy/noisy government data into our clean internal Domain Model.
- **High-Speed Cache:** Data is loaded into a "Green" Redis environment. Swapping occurs atomically with 0ms impact. The _Registry Integrator Service_ queries this internal cache for sub-millisecond enrichment.

### 2.4. Analytics & Serving Tier

- **Stream Processor:** Apache Flink correlates temporal events (truck movements from Point A to Point B) using sliding windows.
- **OLAP Database:** ClickHouse optimized with Sparse Indexes for sub-second analytical queries.
- **Backend API:** FastAPI serving real-time and historical data to the React frontend portal.

---

## 3. Information Flow

The journey of a data point from the highway to the user portal follows this sequence:

1.  **Capture & Crop:** A camera detects a truck, crops the license plate and logo locally, and requests a presigned URL.
2.  **Ingestion:** The payload is uploaded to S3. S3 emits an `ObjectCreated` event to Kafka.
3.  **Extraction:** The Image Routing Service reads the event and sends the image URIs to the OCR and Logo microservices.
4.  **Enrichment:** Extracted text is passed to the Registry Integrator, which instantly retrieves carrier details from the internal Redis replica (bypassing external FMCSA APIs).
5.  **Event Aggregation:** The fully enriched event (`truck_id`, `carrier_id`, `timestamp`, `location`) is written back to Kafka.
6.  **Stream Analytics:** Flink reads the enriched stream, detects that `truck_X` was in City A yesterday and City B today, and updates the routing metrics.
7.  **User Query:** A user searches for City A to City B on the React portal. The FastAPI backend queries the ClickHouse OLAP (or Materialized View in the MVP) and returns the aggregated carrier list in milliseconds.

---

## 4. Database Design (Polyglot Persistence)

To handle both high-throughput writes and complex analytical reads, the data layer is strictly separated.

### 4.1. Operational Database (OLTP - PostgreSQL)

Used for managing core business entities, configurations, and state.

- **`Cameras`**
  - `camera_id` (UUID, PK)
  - `location_city` (VARCHAR, Indexed)
  - `lat` / `lng` (Decimal)
  - `status` (VARCHAR)
- **`Carriers`** (Populated via the ACL ETL process)
  - `carrier_id` (UUID, PK)
  - `usdot_number` (VARCHAR, Unique, Indexed)
  - `company_name` (VARCHAR)
- **`Trucks`**
  - `truck_id` (UUID, PK)
  - `license_plate` (VARCHAR, Indexed)
  - `carrier_id` (UUID, FK -> Carriers)

### 4.2. Analytical Database (OLAP - ClickHouse / BigQuery)

Used for storing the immutable event stream for fast portal querying.

- **`Truck_Detections_Log`** (Fact Table)
  - `event_id` (String)
  - `timestamp` (DateTime) - _Primary Sort Key_
  - `camera_id` (UUID)
  - `truck_id` (UUID)
  - `carrier_id` (UUID)

### 4.3. Serving Layer Optimization (MVP Scope)

To power the specific portal query ("which carriers move most trucks between City A and B"), a **Materialized View** aggregates the temporal data.

- **`mv_route_carrier_stats`**
  - `origin_city` (VARCHAR)
  - `destination_city` (VARCHAR)
  - `carrier_id` (UUID)
  - `truck_count` (Integer)
  - _(Note: This allows the FastAPI endpoint to perform a simple, sub-millisecond `SELECT` query to rank carriers without joining millions of rows on the fly)._

---

## 5. MVP Implementation Strategy (The Prototype)

To validate the business logic within the constraints of a technical exercise (5-hour window, zero budget), the prototype maps complex production concepts to pragmatic implementations:

| Production Concept       | MVP Implementation (Hack)        | Reason                                              |
| :----------------------- | :------------------------------- | :-------------------------------------------------- |
| **Edge Capture**         | Synthetic Data Generator         | Simulates camera detections without hardware.       |
| **ACL / ETL**            | `seed.py`                        | Demonstrates data cleaning and ingestion logic.     |
| **ClickHouse OLAP**      | **PostgreSQL Materialized View** | High signal for SQL fluency without infra overhead. |
| **Global Load Balancer** | Vercel (Edge) + Render (API)     | Demonstrates modern, decoupled deployment.          |
| **Google Maps API**      | **Leaflet / OpenStreetMap**      | Zero-friction, open-source mapping.                 |
