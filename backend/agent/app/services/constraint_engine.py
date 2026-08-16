from app.models.state import ConstraintState, Constraint, HealthStatus

def evaluate_constraints(state: ConstraintState) -> HealthStatus:
    issues = []
    status = "healthy"
    
    for c in state.constraints:
        if c.status == "violated":
            issues.append(c.description)
            status = "violated"
    
    if len(issues) > 0:
        return HealthStatus(status=status, issues=issues)
        
    return HealthStatus(status="healthy", issues=[])
