from pydantic import BaseModel
from typing import List, Optional

class Disruption(BaseModel):
    type: str
    vendor_id: Optional[str] = None
    description: Optional[str] = None

class RecoveryOption(BaseModel):
    option_id: str
    title: str
    description: str
    estimated_cost_change: float
    budget_remaining_after: float
    affected_constraints: List[str]
    pros: List[str]
    cons: List[str]
    recommended: bool

class RecoveryPlan(BaseModel):
    summary: str
    risk_level: str
    options: List[RecoveryOption]
    recommendation_reason: str
