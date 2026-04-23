"""
Genlogs ETL Pipeline (ACL Implementation)
Version: 1.0.0

This script implements the Anti-Corruption Layer (ACL) for the Genlogs platform.
It ingests raw, external CSV data, performs sanitization and normalization, 
and loads it into the internal PostgreSQL domain model.
"""

import os
import csv
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def sanitize_name(name: str) -> str:
    """ACL Logic: Clean and normalize carrier names to maintain domain integrity.
    
    Args:
        name: Raw carrier name from external source.
    Returns:
        Title-cased, whitespace-normalized name.
    """
    if not name:
        return "Unknown"
    # Remove extra spaces and normalize title case
    clean_name = " ".join(name.split()).title()
    return clean_name

def run_etl():
    """Executes the full ETL pipeline:
    1. Extraction: Reads from carriers_raw.csv
    2. Transformation: Normalizes names and generates synthetic detection IDs.
    3. Loading: Upserts into 'carriers' and 'truck_detections' tables.
    4. Optimization: Refreshes the Materialized View for the analytical tier.
    """
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in environment.")
        return

    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # 1. Extraction Tier
        raw_data_path = os.path.join(os.path.dirname(__file__), "carriers_raw.csv")
        carriers_to_insert = {} # usdot -> name
        detections_to_insert = []

        with open(raw_data_path, mode='r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                usdot = int(row['usdot'])
                name = sanitize_name(row['name'])
                origin = row['origin'].strip()
                dest = row['dest'].strip()
                count = int(row['count'])

                carriers_to_insert[usdot] = name
                
                # Simulation Logic: Generate multiple detections based on frequency counts
                for i in range(count):
                    detections_to_insert.append((
                        f"TRUCK-{usdot}-{i}", # Synthetic Unique Truck ID
                        usdot,
                        origin,
                        dest
                    ))

        # Atomic Refresh: Clear old data for the MVP simulation
        cur.execute("TRUNCATE truck_detections CASCADE")
        cur.execute("TRUNCATE carriers CASCADE")
        
        # 2. Transformation & Loading: Upsert Carriers
        carrier_values = [(u, n) for u, n in carriers_to_insert.items()]
        execute_values(cur, """
            INSERT INTO carriers (usdot_number, name) 
            VALUES %s 
            ON CONFLICT (usdot_number) DO UPDATE SET name = EXCLUDED.name
        """, carrier_values)

        # 3. Loading: Insert Enriched Detections
        # Retrieve internal carrier IDs to satisfy relational foreign keys
        cur.execute("SELECT id, usdot_number FROM carriers")
        id_map = {usdot: cid for cid, usdot in cur.fetchall()}

        final_detections = [
            (tid, id_map[usdot], origin, dest) 
            for tid, usdot, origin, dest in detections_to_insert
        ]

        execute_values(cur, """
            INSERT INTO truck_detections (truck_id, carrier_id, origin_city, dest_city) 
            VALUES %s
        """, final_detections)

        # 4. OLAP Optimization: Refresh Materialized View
        print("Refreshing Materialized View for sub-second ranking...")
        cur.execute("REFRESH MATERIALIZED VIEW mv_route_carrier_stats")

        conn.commit()
        print(f"ETL Success: Loaded {len(final_detections)} detections into the analytical tier.")

    except Exception as e:
        print(f"ETL Failed during pipeline execution: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    run_etl()
