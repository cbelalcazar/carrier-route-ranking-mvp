import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_contract_integrity():
    """Ensure the API response exactly matches the expected JSON schema."""
    response = client.get("/api/v1/search?origin=SF&destination=LA")
    assert response.status_code == 200
    json_data = response.json()
    
    # Required keys
    assert "origin" in json_data
    assert "destination" in json_data
    assert "carriers" in json_data
    assert "execution_time_ms" in json_data
    assert isinstance(json_data["carriers"], list)
    assert isinstance(json_data["execution_time_ms"], float)
    
    # Carrier object structure
    if len(json_data["carriers"]) > 0:
        carrier = json_data["carriers"][0]
        assert "name" in carrier
        assert "trucks_per_day" in carrier
        assert isinstance(carrier["trucks_per_day"], int)

def test_ranking_order():
    """Ensure carriers are always sorted by trucks_per_day descending."""
    response = client.get("/api/v1/search?origin=New%20York&destination=Washington")
    assert response.status_code == 200
    carriers = response.json()["carriers"]
    
    volumes = [c["trucks_per_day"] for c in carriers]
    assert volumes == sorted(volumes, reverse=True), "Ranking must be sorted by volume DESC"

@pytest.mark.parametrize("origin,dest", [
    ("sf", "la"),
    (" SF ", " LA "),
    ("San Francisco, CA", "Los Angeles, CA"),
    ("SAN FRANCISCO", "LOS ANGELES"),
])
def test_input_normalization_exhaustion(origin, dest):
    """Exhaustive check for string normalization across different user inputs."""
    response = client.get(f"/api/v1/search?origin={origin}&destination={dest}")
    assert response.status_code == 200
    data = response.json()
    # Should always identify the SF corridor and return 3 carriers
    assert len(data["carriers"]) == 3
    assert any("XPO" in c["name"].upper() for c in data["carriers"])

def test_empty_results_fallback_consistency():
    """Verify that any random pair triggers the federal fallback (UPS/FedEx)."""
    # Route that definitely doesn't exist in our seed
    response = client.get("/api/v1/search?origin=Atlantis&destination=Mars")
    assert response.status_code == 200
    carriers = response.json()["carriers"]
    assert len(carriers) == 2
    names = [c["name"].lower() for c in carriers]
    assert "ups inc." in names
    assert "fedex corp" in names

def test_malicious_input_safety():
    """Test how the API handles potential injection or weird characters."""
    weird_city = "New York'; DROP TABLE carriers; --"
    response = client.get(f"/api/v1/search?origin={weird_city}&destination=DC")
    # Should not crash and should return the default fallback since it's not a major route
    assert response.status_code == 200
    assert len(response.json()["carriers"]) == 2

def test_large_payload_simulation():
    """Verify performance doesn't degrade with valid but long inputs."""
    long_city = "A" * 100
    response = client.get(f"/api/v1/search?origin={long_city}&destination=DC")
    assert response.status_code == 200

def test_case_insensitivity_db_match():
    """Verify that 'new york, ny' and 'NEW YORK, NY' return the same DB records."""
    res1 = client.get("/api/v1/search?origin=new%20york,%20ny&destination=washington,%20dc")
    res2 = client.get("/api/v1/search?origin=NEW%20YORK,%20NY&destination=WASHINGTON,%20DC")
    assert res1.json()["carriers"] == res2.json()["carriers"]
