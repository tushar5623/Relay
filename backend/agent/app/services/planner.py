import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from app.models.planner import RecoveryPlan

def plan_recovery(state: dict, impact: dict, disruption: dict) -> RecoveryPlan:
    load_dotenv()
    api_key = os.environ.get("LLM_API_KEY") or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set. Cannot run planner.")
        
    client = OpenAI(api_key=api_key)
    
    prompt = f"""
You are Relay, an AI event operations planner.
A disruption has occurred. You must analyze the situation and provide structured recovery options.
Do NOT invent replacement vendor prices or availability unless they exist in the state.
If you need a new vendor, you can suggest finding a new one and estimate typical market costs if appropriate, but do not hallucinate specific real vendors. Ensure you return 2-3 ranked recovery options.

CURRENT EVENT STATE:
{json.dumps(state, indent=2)}

IMPACT ANALYSIS:
{json.dumps(impact, indent=2)}

DISRUPTION:
{json.dumps(disruption, indent=2)}

You must evaluate the `active_quotes` provided in the CURRENT EVENT STATE if they exist.
If the preferred option exceeds the remaining budget, you MUST surface a concrete tradeoff in the option description or recommendation reason. For example: "Selecting Willow & Vine requires reducing another planned expense by ₹X."

Provide your response strictly following the requested JSON schema. Include at least two recovery options.
"""
    
    try:
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a deterministic event recovery planner."},
                {"role": "user", "content": prompt}
            ],
            response_format=RecoveryPlan,
            temperature=0.2
        )
        return response.choices[0].message.parsed
    except Exception as e:
        raise ValueError(f"LLM parsing or execution failed: {str(e)}")
