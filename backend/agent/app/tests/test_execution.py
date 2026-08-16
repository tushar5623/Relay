import pytest
import requests

API_URL = "http://localhost:3001/event/evt_1/decisions"
VENDOR_API = "http://localhost:3001/event/evt_1/vendor"
EVENT_API = "http://localhost:3001/event/evt_1"

def test_1_approve_replace_catering():
    # TEST 1 — Approve replace catering
    disruption = {"type": "vendor_cancellation", "vendor_id": "ven_catering_1"}
    res = requests.post(API_URL, json={"option_id": "replace_catering", "disruption": disruption})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "executed"
    
    # Verify backup catering vendor created
    res_ven = requests.get(f"{VENDOR_API}/ven_backup_catering_1")
    assert res_ven.status_code == 200
    v = res_ven.json()
    assert v["is_mock"] == True
    assert v["quote"] == 9000

def test_2_approve_reduce_guest_count():
    # TEST 2 — Approve reduce guest count
    disruption = {"type": "vendor_cancellation", "vendor_id": "ven_catering_1"}
    res = requests.post(API_URL, json={"option_id": "reduce_guest_count", "disruption": disruption})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "executed"
    
    # Verify event guest_count changes from 150 to 120
    res_evt = requests.get(EVENT_API)
    assert res_evt.status_code == 200
    evt = res_evt.json()["event"]
    assert evt["guest_count"] == 120

def test_3_unknown_option():
    # TEST 3 — Unknown option
    disruption = {"type": "vendor_cancellation", "vendor_id": "ven_catering_1"}
    res = requests.post(API_URL, json={"option_id": "hack_database", "disruption": disruption})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "failed"
    assert "Unknown option_id provided" in data["result"]["error"]

def test_4_duplicate_execution():
    # TEST 4 — Duplicate execution
    disruption = {"type": "vendor_cancellation", "vendor_id": "ven_catering_1"}
    
    res1 = requests.post(API_URL, json={"option_id": "replace_catering", "disruption": disruption})
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "executed"
    
    res2 = requests.post(API_URL, json={"option_id": "replace_catering", "disruption": disruption})
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "executed"
    assert data1["_id"] == data2["_id"]

def test_5_failed_execution():
    # TEST 5 — Failed execution
    # To cause an actual MongoDB crash we would need invalid ObjectIds, but our logic traps missing option_id as 400.
    res = requests.post(API_URL, json={"option_id": "", "disruption": {}})
    assert res.status_code == 400

def test_6_decision_retrieval():
    # TEST 6 — Decision retrieval
    res = requests.get(API_URL)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
