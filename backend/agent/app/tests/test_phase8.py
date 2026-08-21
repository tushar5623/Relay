import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
import websockets
import json

from app.main import app
from app.database import get_db

@pytest.mark.anyio
async def test_1_headcount_change():
    db = get_db()
    evt = db.events.find_one({"_id": "evt_1"})
    initial_count = evt["guest_count"]
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # We don't have express here, so we will manually update DB then call rescope
        db.events.update_one({"_id": "evt_1"}, {"$inc": {"guest_count": 12}})
        
        # Test rescope when not running
        response = await ac.post("/agent/evt_1/rescope", json={"delta": 12})
        assert response.status_code == 200
        assert response.json() == {"status": "not_active"}
        
        # Revert
        db.events.update_one({"_id": "evt_1"}, {"$set": {"guest_count": initial_count}})

@pytest.mark.anyio
async def test_rescope_flow_and_tradeoff():
    # Reset DB
    db = get_db()
    db.events.update_one({"_id": "evt_1"}, {"$set": {"guest_count": 150}})
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Start negotiation
        response = await ac.post("/plan/evt_1", json={
            "type": "vendor_cancellation",
            "vendor_id": "ven_catering_1"
        })
        assert response.status_code == 200
        assert response.json()["status"] == "started"
        
        # Try to start a second negotiation
        response2 = await ac.post("/plan/evt_1", json={
            "type": "vendor_cancellation",
            "vendor_id": "ven_catering_1"
        })
        assert response2.json()["status"] == "already_running"
        
        # Wait a moment, update DB, trigger rescope
        await asyncio.sleep(1.0)
        db.events.update_one({"_id": "evt_1"}, {"$inc": {"guest_count": 12}})
        
        rescope_response = await ac.post("/agent/evt_1/rescope", json={"delta": 12})
        assert rescope_response.json()["status"] == "rescoped"
        
        # Wait for the negotiation to finish naturally
        # Since it's a background task calling OpenAI, it may take 10-15 seconds
        from app.services.negotiation_state import get_agent_state
        state = get_agent_state("evt_1")
        
        for _ in range(30):
            if not state.in_progress:
                break
            await asyncio.sleep(1.0)
            
        # Verify negotiation is no longer active
        assert not state.in_progress
