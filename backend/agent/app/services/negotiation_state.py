import asyncio
from typing import Dict, Any, Optional

class NegotiationState:
    def __init__(self):
        self.in_progress: bool = False
        self.active_disruption: Optional[Dict[str, Any]] = None
        self.headcount: int = 150
        self.negotiation_id: Optional[str] = None
        self.rescope_event = asyncio.Event()

# Global state dictionary: event_id -> NegotiationState
_agent_state: Dict[str, NegotiationState] = {}

def get_agent_state(event_id: str) -> NegotiationState:
    if event_id not in _agent_state:
        _agent_state[event_id] = NegotiationState()
    return _agent_state[event_id]
