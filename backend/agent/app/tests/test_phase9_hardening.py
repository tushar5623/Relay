import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
import httpx
from app.main import app
from app.database import get_db

@pytest.mark.anyio
async def test_rescope_without_active_negotiation():
    """Verify rescoping fails safely when no negotiation is active."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/agent/evt_1/rescope", json={"delta": 12})
        assert response.status_code == 200
        assert response.json() == {"status": "not_active"}

@pytest.mark.anyio
async def test_unknown_option_execution():
    """Verify execution of hallucinated option IDs rejects safely."""
    async with httpx.AsyncClient(base_url="http://localhost:3001") as client:
        response = await client.post("/event/evt_1/decisions", json={
            "option_id": "hack_the_database",
            "disruption": {"type": "vendor_cancellation", "vendor_id": "ven_catering_1"}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failed"
        assert "Unknown option_id" in data["result"]["error"]

@pytest.mark.anyio
async def test_double_execution_idempotency():
    """Verify executing the same option twice doesn't mutate DB twice."""
    async with httpx.AsyncClient(base_url="http://localhost:3001") as client:
        # First execution
        resp1 = await client.post("/event/evt_1/decisions", json={
            "option_id": "opt_2",
            "disruption": {"type": "vendor_cancellation", "vendor_id": "ven_test_dup"}
        })
        assert resp1.status_code == 200
        
        # Second execution immediately
        resp2 = await client.post("/event/evt_1/decisions", json={
            "option_id": "opt_2",
            "disruption": {"type": "vendor_cancellation", "vendor_id": "ven_test_dup"}
        })
        assert resp2.status_code == 200
        assert resp2.json()["status"] == "executed"
        
        # We should only have ONE decision in the DB for this disruption
        db = get_db()
        count = db.decisions.count_documents({
            "event_id": "evt_1",
            "option_id": "opt_2",
            "disruption.vendor_id": "ven_test_dup"
        })
        assert count == 1
        
        # Reset DB back
        db.decisions.delete_many({"disruption.vendor_id": "ven_test_dup"})
