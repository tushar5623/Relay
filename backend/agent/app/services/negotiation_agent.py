import asyncio
import os
from app.database import get_db
from app.services.state_builder import build_state
from app.services.impact_analyzer import analyze_impact
from app.services.planner import plan_recovery
from app.services.negotiation_state import get_agent_state
from app.ws_manager import ws_manager

async def run_negotiation(event_id: str, disruption: dict):
    state = get_agent_state(event_id)
    if state.in_progress and state.negotiation_id is not None:
        # If it's already in progress AND has an ID, another background task is running it.
        # But since we set in_progress in main.py, it will be true here. So just proceed.
        pass
        
    state.active_disruption = disruption
    state.negotiation_id = "neg_" + os.urandom(4).hex()
    state.rescope_event.clear()
    
    db = get_db()
    
    await ws_manager.broadcast(event_id, {
        "type": "agent.thought", 
        "data": "Catering cancellation detected. I’m checking the downstream budget and vendor constraints."
    })
    
    while True:
        raw_event = db.events.find_one({"_id": event_id})
        state.headcount = raw_event["guest_count"]
        
        await ws_manager.broadcast(event_id, {
            "type": "agent.thought", 
            "data": f"I found three backup catering candidates. I’m requesting quotes for {state.headcount} guests."
        })
        
        candidates = ["Marigold Catering", "Copper Pot Events", "Willow & Vine"]
        await ws_manager.broadcast(event_id, {
            "type": "agent.tool_call", 
            "data": f"get_quotes(candidates={candidates}, headcount={state.headcount})"
        })
        
        try:
            # 4 second delay to simulate mock vendor response times
            await asyncio.wait_for(state.rescope_event.wait(), timeout=4.0)
            
            # If we arrive here, rescope_event was triggered
            state.rescope_event.clear()
            await ws_manager.broadcast(event_id, {
                "type": "agent.thought", 
                "data": f"Headcount increased to {state.headcount} guests. I’m rescoping the active negotiation instead of restarting it."
            })
            continue 
        except asyncio.TimeoutError:
            pass
            
        quotes = [
            {"name": "Marigold Catering", "quote": 5800 * state.headcount},
            {"name": "Copper Pot Events", "quote": 6200 * state.headcount},
            {"name": "Willow & Vine", "quote": 5500 * state.headcount}
        ]
        
        await ws_manager.broadcast(event_id, {
            "type": "agent.thought", 
            "data": f"Updated quotes received for {state.headcount} guests. The additional guests increase catering cost and change the budget tradeoff."
        })
        
        raw_vendors = list(db.vendors.find({"event_id": event_id}))
        raw_guests = list(db.guests.find({"event_id": event_id}))
        evt_state, graph = build_state(raw_event, raw_vendors, raw_guests)
        
        impact_node = "vendor_availability" if "vendor_id" in disruption else "event_status"
        impact_nodes = analyze_impact(graph, impact_node)
        impact_analysis = {
            "changed_node": impact_node,
            "affected_nodes": impact_nodes
        }
        
        evt_state_dict = evt_state.model_dump()
        evt_state_dict["active_quotes"] = quotes
        
        try:
            plan = await asyncio.to_thread(
                plan_recovery, 
                evt_state_dict, 
                impact_analysis, 
                disruption
            )
            
            await ws_manager.broadcast(event_id, {
                "type": "agent.recommendation", 
                "data": plan.model_dump()
            })
        except Exception as e:
            await ws_manager.broadcast(event_id, {
                "type": "agent.thought", 
                "data": f"Negotiation failed: {str(e)}"
            })
        
        state.in_progress = False
        break
