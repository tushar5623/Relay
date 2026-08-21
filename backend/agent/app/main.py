from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import get_db
from app.services.state_builder import build_state
from app.services.constraint_engine import evaluate_constraints
from app.services.impact_analyzer import analyze_impact
from app.services.planner import plan_recovery
from app.models.state import StateSnapshot, ImpactAnalysisRequest, ImpactAnalysisResult
from app.models.planner import RecoveryPlan
from app.ws_manager import ws_manager
from app.services.negotiation_state import get_agent_state
from app.services.negotiation_agent import run_negotiation

app = FastAPI(title="Relay Agent Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: str):
    await ws_manager.connect(websocket, event_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, event_id)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "relay-agent"
    }

@app.get("/state/{event_id}", response_model=StateSnapshot)
async def get_state(event_id: str):
    db = get_db()
    raw_event = db.events.find_one({"_id": event_id})
    if not raw_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    raw_vendors = list(db.vendors.find({"event_id": event_id}))
    raw_guests = list(db.guests.find({"event_id": event_id}))
    
    state, graph = build_state(raw_event, raw_vendors, raw_guests)
    health = evaluate_constraints(state)
    
    return StateSnapshot(state=state, graph=graph, health=health)

@app.post("/state/{event_id}/impact", response_model=ImpactAnalysisResult)
async def impact_analysis(event_id: str, request: ImpactAnalysisRequest):
    db = get_db()
    raw_event = db.events.find_one({"_id": event_id})
    if not raw_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    raw_vendors = list(db.vendors.find({"event_id": event_id}))
    raw_guests = list(db.guests.find({"event_id": event_id}))
    
    state, graph = build_state(raw_event, raw_vendors, raw_guests)
    
    disruption = request.disruption or {}
    disruption_type = disruption.get("type", "")
    
    # Map disruption type to constraint graph node
    node_id = "event_status"
    if request.node:
        node_id = request.node
    elif disruption_type == "vendor_cancellation":
        node_id = "vendor_availability"
    elif disruption_type == "budget_change":
        node_id = "remaining_budget"
    elif disruption_type == "headcount_change":
        node_id = "guest_count"
    elif disruption_type == "timeline_conflict":
        node_id = "timeline_schedule"
        
    if node_id not in graph:
        raise HTTPException(status_code=400, detail=f"Node {node_id} not found in constraint graph")
        
    affected_nodes = analyze_impact(graph, node_id)
    
    affected_budget = []
    affected_timeline = []
    affected_vendors = []
    affected_tasks = []
    consequences = []
    
    for a_node_id in affected_nodes:
        if a_node_id not in graph:
            continue
        node = graph[a_node_id]
        if node.node_type == "financial":
            affected_budget.append(a_node_id)
        elif node.node_type == "time":
            affected_timeline.append(a_node_id)
        elif node.node_type == "operational":
            affected_vendors.append(a_node_id)
            affected_tasks.append(a_node_id)
        consequences.append(f"Node {a_node_id} ({node.node_type}) is affected.")
    
    return ImpactAnalysisResult(
        disruption_id=disruption.get("disruption_id", "unknown"),
        affected_budget=affected_budget,
        affected_timeline=affected_timeline,
        affected_vendors=affected_vendors,
        affected_tasks=affected_tasks,
        affected_nodes=affected_nodes,
        consequences=consequences
    )

@app.post("/plan/{event_id}")
async def generate_plan(event_id: str, disruption: dict):
    state = get_agent_state(event_id)
    if state.in_progress:
        return {"status": "already_running"}
        
    state.in_progress = True
    import asyncio
    asyncio.create_task(run_negotiation(event_id, disruption))
    return {"status": "started"}

class RescopeRequest(BaseModel):
    delta: int

@app.post("/agent/{event_id}/rescope")
async def rescope_negotiation(event_id: str, request: RescopeRequest):
    state = get_agent_state(event_id)
    if not state.in_progress:
        return {"status": "not_active"}
        
    state.rescope_event.set()
    return {"status": "rescoped"}
