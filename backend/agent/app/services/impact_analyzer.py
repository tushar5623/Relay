from typing import Dict, List, Set
from app.models.state import GraphNode

def analyze_impact(graph: Dict[str, GraphNode], start_node_id: str) -> List[str]:
    affected: Set[str] = set()
    queue = [start_node_id]
    
    while queue:
        current_id = queue.pop(0)
        if current_id not in affected:
            affected.add(current_id)
            if current_id in graph:
                queue.extend(graph[current_id].dependents)
                
    # Return list of affected nodes (in BFS discovery order roughly)
    return list(affected)
