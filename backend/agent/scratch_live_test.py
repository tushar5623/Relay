import requests
import json
import sys

print("Running live test...")
try:
    res = requests.post(
        "http://localhost:8000/plan/evt_1", 
        json={"type": "vendor_cancellation", "vendor_id": "ven_catering_1"},
        timeout=30
    )
    print(f"Status Code: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(json.dumps(data, indent=2))
        sys.exit(0)
    else:
        print(f"Error: {res.text}")
        sys.exit(1)
except Exception as e:
    print(f"Request failed: {str(e)}")
    sys.exit(1)
