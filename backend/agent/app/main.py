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
    
    # Simple mapping for flexibility in demo queries
    node_id = request.node
    if "catering" in node_id and "status" in node_id:
        node_id = "vendor_availability"
        
    if node_id not in graph:
        raise HTTPException(status_code=400, detail=f"Node {request.node} not found in constraint graph")
        
    affected = analyze_impact(graph, node_id)
    
    return ImpactAnalysisResult(
        changed=request.node,
        old_value=str(request.old_value),
        new_value=str(request.new_value),
        affected_nodes=affected
    )

@app.post("/plan/{event_id}")
async def generate_plan(event_id: str, disruption: dict, background_tasks: BackgroundTasks):
    state = get_agent_state(event_id)
    if state.in_progress:
        return {"status": "already_running"}
        
    state.in_progress = True
    background_tasks.add_task(run_negotiation, event_id, disruption)
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
