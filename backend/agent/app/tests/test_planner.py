import pytest
from unittest.mock import patch, MagicMock
from app.models.planner import RecoveryPlan, RecoveryOption

@pytest.fixture
def mock_state():
    return {
        "event": {
            "budget_total": 18000,
            "budget_spent": 17600,
            "remaining_budget": 400
        },
        "vendors": [],
        "guests": 150,
        "constraints": []
    }

@pytest.fixture
def mock_impact():
    return {
        "changed_node": "vendor_availability",
        "affected_nodes": ["event_feasibility", "event_status"]
    }

@patch('os.environ.get')
@patch('app.services.planner.OpenAI')
def test_plan_recovery_baseline(mock_openai, mock_env_get, mock_state, mock_impact):
    mock_env_get.return_value = "fake_key"
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    
    mock_response = MagicMock()
    mock_parsed = RecoveryPlan(
        summary="Everything is fine.",
        risk_level="low",
        options=[],
        recommendation_reason="No issues."
    )
    mock_response.choices = [MagicMock(message=MagicMock(parsed=mock_parsed))]
    mock_client.beta.chat.completions.parse.return_value = mock_response
    
    from app.services.planner import plan_recovery
    
    disruption = {"type": "none"}
    plan = plan_recovery(mock_state, mock_impact, disruption)
    
    assert plan.summary == "Everything is fine."
    assert plan.risk_level == "low"

@patch('os.environ.get')
@patch('app.services.planner.OpenAI')
def test_plan_recovery_cancellation(mock_openai, mock_env_get, mock_state, mock_impact):
    mock_env_get.return_value = "fake_key"
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    
    mock_response = MagicMock()
    mock_parsed = RecoveryPlan(
        summary="Catering cancelled.",
        risk_level="high",
        options=[
            RecoveryOption(
                option_id="opt_1",
                title="Book New Catering",
                description="Find replacement.",
                estimated_cost_change=500,
                budget_remaining_after=-100,
                affected_constraints=["budget"],
                pros=["Event proceeds"],
                cons=["Over budget"],
                recommended=True
            )
        ],
        recommendation_reason="Must feed guests."
    )
    mock_response.choices = [MagicMock(message=MagicMock(parsed=mock_parsed))]
    mock_client.beta.chat.completions.parse.return_value = mock_response
    
    from app.services.planner import plan_recovery
    
    disruption = {"type": "vendor_cancellation", "vendor_id": "ven_catering_1"}
    plan = plan_recovery(mock_state, mock_impact, disruption)
    
    assert len(plan.options) == 1
    assert plan.options[0].estimated_cost_change == 500

@patch('os.environ.get')
@patch('app.services.planner.OpenAI')
def test_invalid_llm_response(mock_openai, mock_env_get, mock_state, mock_impact):
    mock_env_get.return_value = "fake_key"
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    
    # Simulate parse exception
    mock_client.beta.chat.completions.parse.side_effect = Exception("Malformed output")
    
    from app.services.planner import plan_recovery
    
    disruption = {"type": "vendor_cancellation"}
    
    with pytest.raises(ValueError, match="LLM parsing or execution failed: Malformed output"):
        plan_recovery(mock_state, mock_impact, disruption)
