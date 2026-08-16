import pytest
from app.services.state_builder import build_state
from app.services.constraint_engine import evaluate_constraints
from app.services.impact_analyzer import analyze_impact

@pytest.fixture
def baseline_data():
    raw_event = {
        "_id": "evt_1",
        "name": "Priya's Wedding",
        "date": "2026-09-12",
        "guest_count": 150,
        "budget_total": 18000,
        "budget_spent": 17600,
        "status": "on_track"
    }
    
    raw_vendors = [
        {"_id": "v1", "name": "Cat", "category": "catering", "status": "confirmed", "quote": 9000},
        {"_id": "v2", "name": "Ven", "category": "venue", "status": "confirmed", "quote": 4000}
    ]
    
    raw_guests = [{"_id": f"g{i}", "event_id": "evt_1"} for i in range(150)]
    
    return raw_event, raw_vendors, raw_guests


def test_baseline(baseline_data):
    raw_event, raw_vendors, raw_guests = baseline_data
    state, graph = build_state(raw_event, raw_vendors, raw_guests)
    health = evaluate_constraints(state)
    
    assert health.status == "healthy"
    assert len(health.issues) == 0

def test_guest_increase(baseline_data):
    raw_event, raw_vendors, raw_guests = baseline_data
    state, graph = build_state(raw_event, raw_vendors, raw_guests)
    
    affected = analyze_impact(graph, "guest_count")
    
    expected = {
        "guest_count", 
        "catering_requirement", 
        "catering_cost", 
        "budget_spent", 
        "remaining_budget", 
        "event_status"
    }
    assert set(affected) == expected

def test_catering_cancellation(baseline_data):
    raw_event, raw_vendors, raw_guests = baseline_data
    state, graph = build_state(raw_event, raw_vendors, raw_guests)
    
    affected = analyze_impact(graph, "vendor_availability")
    
    expected = {
        "vendor_availability",
        "event_feasibility",
        "budget_relevance",
        "event_status"
    }
    assert set(affected) == expected

def test_budget_violation(baseline_data):
    raw_event, raw_vendors, raw_guests = baseline_data
    raw_event["budget_total"] = 17000
    raw_event["budget_spent"] = 17600
    
    state, graph = build_state(raw_event, raw_vendors, raw_guests)
    health = evaluate_constraints(state)
    
    assert health.status == "violated"
    assert any("Budget exceeded" in issue for issue in health.issues)
