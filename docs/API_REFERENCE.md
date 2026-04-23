# Genlogs API Reference (v1.3.0)

The Genlogs API is built with **FastAPI** and provides endpoints for real-time carrier ranking and logistics analytics.

## Base URL
- **Local:** `http://localhost:8000`
- **Docker:** `http://localhost:8000` (within the network)

## Authentication
Currently, the MVP does not require authentication. In production, this would be secured via **OAuth2 + JWT**.

---

## 1. Carrier Search
Retrieves ranked carriers for a specific route based on historical truck detections.

### Endpoint
`GET /api/v1/search`

### Parameters
| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `origin` | string | Yes | The city of origin (e.g., "New York"). |
| `destination` | string | Yes | The destination city (e.g., "Washington"). |

### Success Response (200 OK)
```json
{
  "origin": "New York",
  "destination": "Washington",
  "carriers": [
    {
      "name": "Knight-Swift Transport Services",
      "trucks_per_day": 10
    },
    {
      "name": "J.B. Hunt Transport Services Inc",
      "trucks_per_day": 7
    }
  ],
  "execution_time_ms": 12.45
}
```

### Response Lógica (Staff Level)
1.  **Sanitization:** The API performs regex-based sanitization to prevent injection.
2.  **OLAP Query:** First tries to query the `mv_route_carrier_stats` materialized view.
3.  **Fallback Mechanism:** If the analytical tier has zero coverage, it uses a predefined fallback logic for specific major routes (NY-DC, SF-LA) or a generic fallback for other routes.

---

## 2. Interactive Documentation
FastAPI automatically generates interactive documentation:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## 3. Error Handling
The API returns standard HTTP status codes:
- `422 Unprocessable Entity`: Validation error (missing query parameters).
- `500 Internal Server Error`: Database connectivity or ETL refresh issues.
