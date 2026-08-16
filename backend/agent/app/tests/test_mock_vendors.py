import pytest
import requests

API_URL = "http://localhost:3001/event/evt_1/vendor"
AGENT_URL = "http://localhost:8000/state/evt_1/impact"

def test_get_vendor():
    # TEST 1 — Get vendor
    res = requests.get("http://localhost:3001/event/evt_1/vendor/ven_catering_1")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "confirmed"
    assert data["quote"] == 9000

def test_vendor_cancellation():
    # TEST 2 — Vendor cancellation
    res = requests.post("http://localhost:3001/event/evt_1/vendor/ven_catering_1/cancel")
    assert res.status_code == 200
    data = res.json()
    assert data["new_status"] == "cancelled"
    assert data["vendor"]["status"] == "cancelled"

def test_vendor_quote_update():
    # TEST 3 — Vendor quote update
    res = requests.patch("http://localhost:3001/event/evt_1/vendor/ven_catering_1/quote", json={"quote": 12000})
    assert res.status_code == 200
    data = res.json()
    assert data["vendor"]["quote"] == 12000

def test_vendor_availability():
    # TEST 4 — Availability
    # Catering is cancelled now
    res = requests.get("http://localhost:3001/event/evt_1/vendor/ven_catering_1/availability")
    assert res.status_code == 200
    assert res.json()["available"] == False

    # Venue is still confirmed
    res = requests.get("http://localhost:3001/event/evt_1/vendor/ven_venue_1/availability")
    assert res.status_code == 200
    assert res.json()["available"] == True

def test_impact_after_cancellation():
    # TEST 5 — Impact after cancellation
    # Use Phase 4's deterministic impact analysis
    res = requests.post(AGENT_URL, json={
        "node": "vendor_availability",
        "old_value": "True",
        "new_value": "False"
    })
    assert res.status_code == 200
    data = res.json()
    affected = data["affected_nodes"]
    
    # Check that it properly identified the constraint graph impact
    assert "vendor_availability" in affected
    assert "event_feasibility" in affected
    assert "event_status" in affected
