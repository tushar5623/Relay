from pydantic import BaseModel
from typing import List, Dict, Optional

class VendorState(BaseModel):
    vendor_id: str
    name: str
    category: str
    status: str
    quote: float

class EventState(BaseModel):
    event_id: str
    event_name: str
    event_date: str
    guest_count: int
    budget_total: float
    budget_spent: float
    remaining_budget: float
    event_status: str

class Constraint(BaseModel):
    type: str
    status: str # 'healthy', 'violated'
    description: str

class ConstraintState(BaseModel):
    event: EventState
    vendors: List[VendorState]
    guests: int
    constraints: List[Constraint]

class GraphNode(BaseModel):
    node_id: str
    node_type: str
    current_value: str
    dependencies: List[str]
    dependents: List[str]

class HealthStatus(BaseModel):
    status: str
    issues: List[str]

class StateSnapshot(BaseModel):
    state: ConstraintState
    graph: Dict[str, GraphNode]
    health: HealthStatus

class ImpactAnalysisRequest(BaseModel):
    node: str
    old_value: str
    new_value: str

class ImpactAnalysisResult(BaseModel):
    changed: str
    old_value: str
    new_value: str
    affected_nodes: List[str]
