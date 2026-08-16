from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.models.planner import Disruption

class Decision(BaseModel):
    decision_id: str
    event_id: str
    option_id: str
    status: str
    approved_by: str
    created_at: str
    executed_at: Optional[str] = None
    disruption: Optional[Disruption] = None
    result: Optional[Dict[str, Any]] = None
