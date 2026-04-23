import os
import csv
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def sanitize_name(name):
    """ACL Logic: Clean and normalize carrier names."""
    if not name:
        return "Unknown"
    # Remove extra spaces and normalize title case
    clean_name = " ".join(name.split()).title()
    return clean_name

def run_etl():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in environment.")
        return

    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # 1. Read Raw Data
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
                
                # Simulate multiple detections based on the count
                for i in range(count):
                    detections_to_insert.append((
                        f"TRUCK-{usdot}-{i}", # Simulated Truck ID
                        usdot,
                        origin,
                        dest
                    ))

        # Clear old data for the MVP simulation
        cur.execute("TRUNCATE truck_detections CASCADE")
        cur.execute("TRUNCATE carriers CASCADE")
        
        # 2. Upsert Carriers
        carrier_values = [(u, n) for u, n in carriers_to_insert.items()]
        execute_values(cur, """
            INSERT INTO carriers (usdot_number, name) 
            VALUES %s 
            ON CONFLICT (usdot_number) DO UPDATE SET name = EXCLUDED.name
        """, carrier_values)

        # 3. Insert Detections
        # We need the internal carrier ID for the detections table
        cur.execute("SELECT id, usdot_number FROM carriers")
        id_map = {usdot: cid for cid, usdot in cur.fetchall()}

        final_detections = [
            (tid, id_map[usdot], origin, dest) 
            for tid, usdot, origin, dest in detections_to_insert
        ]

        # Clear old detections for the MVP simulation
        cur.execute("TRUNCATE truck_detections CASCADE")
        
        execute_values(cur, """
            INSERT INTO truck_detections (truck_id, carrier_id, origin_city, dest_city) 
            VALUES %s
        """, final_detections)

        # 4. Refresh Materialized View
        print("Refreshing Materialized View...")
        cur.execute("REFRESH MATERIALIZED VIEW mv_route_carrier_stats")

        conn.commit()
        print(f"ETL Success: Loaded {len(final_detections)} detections.")

    except Exception as e:
        print(f"ETL Failed: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    run_etl()
