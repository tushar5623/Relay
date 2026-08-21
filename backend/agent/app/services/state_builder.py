from app.models.state import ConstraintState, EventState, VendorState, Constraint, GraphNode
from typing import Dict, Tuple

def build_state(raw_event: dict, raw_vendors: list, raw_guests: list) -> Tuple[ConstraintState, Dict[str, GraphNode]]:
    # 1. Build Event State
    guest_count = raw_event.get("guest_count", len(raw_guests))
    budget_total = raw_event.get("budget_total", 0)
    budget_spent = raw_event.get("budget_spent", 0)
    remaining_budget = budget_total - budget_spent
    
    event_state = EventState(
        event_id=raw_event["_id"],
        event_name=raw_event["name"],
        event_date=raw_event["date"],
        guest_count=guest_count,
        budget_total=budget_total,
        budget_spent=budget_spent,
        remaining_budget=remaining_budget,
        event_status=raw_event["status"],
        timeline=raw_event.get("timeline", [])
    )
    
    # 2. Build Vendor State
    vendors = [
        VendorState(
            vendor_id=v["_id"],
            name=v["name"],
            category=v["category"],
            status=v["status"],
            quote=v["quote"]
        ) for v in raw_vendors
    ]
    
    # 3. Evaluate Constraints deterministically
    constraints = []
    
    # Budget constraint
    if remaining_budget < 0:
        constraints.append(Constraint(type="budget", status="violated", description="Budget exceeded"))
    else:
        constraints.append(Constraint(type="budget", status="healthy", description="Within budget"))
        
    # Guest constraint (Assuming an arbitrary venue limit of 200 for prototype deterministic logic)
    if guest_count > 200:
        constraints.append(Constraint(type="capacity", status="violated", description="Guest count exceeds maximum venue capacity (200)"))
    else:
        constraints.append(Constraint(type="capacity", status="healthy", description="Guest count within capacity"))
        
    # Vendor availability
    has_catering = any(v.category == "catering" and v.status == "confirmed" for v in vendors)
    has_venue = any(v.category == "venue" and v.status == "confirmed" for v in vendors)
    if not has_catering:
        constraints.append(Constraint(type="vendor", status="violated", description="Missing confirmed catering vendor"))
    elif not has_venue:
        constraints.append(Constraint(type="vendor", status="violated", description="Missing confirmed venue vendor"))
    else:
        constraints.append(Constraint(type="vendor", status="healthy", description="Required vendors are confirmed"))
        
    state = ConstraintState(event=event_state, vendors=vendors, guests=guest_count, constraints=constraints)
    
    # 4. Build Constraint Graph
    graph: Dict[str, GraphNode] = {
        "timeline_schedule": GraphNode(
            node_id="timeline_schedule", node_type="time", current_value=f"{len(event_state.timeline)} blocks",
            dependencies=[], dependents=["event_date"]
        ),
        "event_date": GraphNode(
            node_id="event_date", node_type="time", current_value=str(event_state.event_date),
            dependencies=["timeline_schedule"], dependents=["vendor_availability"]
        ),
        "guest_count": GraphNode(
            node_id="guest_count", node_type="metric", current_value=str(guest_count),
            dependencies=[], dependents=["catering_requirement"]
        ),
        "catering_requirement": GraphNode(
            node_id="catering_requirement", node_type="operational", current_value="dependent on guests",
            dependencies=["guest_count"], dependents=["catering_cost"]
        ),
        "catering_cost": GraphNode(
            node_id="catering_cost", node_type="financial", current_value="derived from catering_requirement",
            dependencies=["catering_requirement"], dependents=["budget_spent"]
        ),
        "vendor_availability": GraphNode(
            node_id="vendor_availability", node_type="operational", current_value=str(has_catering and has_venue),
            dependencies=["event_date"], dependents=["event_feasibility"]
        ),
        "budget_spent": GraphNode(
            node_id="budget_spent", node_type="financial", current_value=str(budget_spent),
            dependencies=["catering_cost"], dependents=["remaining_budget"]
        ),
        "remaining_budget": GraphNode(
            node_id="remaining_budget", node_type="financial", current_value=str(remaining_budget),
            dependencies=["budget_spent"], dependents=["event_status"]
        ),
        "event_feasibility": GraphNode(
            node_id="event_feasibility", node_type="status", current_value=str(has_catering and has_venue),
            dependencies=["vendor_availability"], dependents=["budget_relevance", "event_status"]
        ),
        "budget_relevance": GraphNode(
            node_id="budget_relevance", node_type="logic", current_value="dependent on feasibility",
            dependencies=["event_feasibility"], dependents=["event_status"]
        ),
        "event_status": GraphNode(
            node_id="event_status", node_type="status", current_value=event_state.event_status,
            dependencies=["remaining_budget", "event_feasibility", "budget_relevance"], dependents=[]
        )
    }
    
    return state, graph
