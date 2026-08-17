# Relay — Autonomous AI Event Operations Agent

Relay is an AI agent that helps keep an event on track when problems happen.

It does more than track the budget, vendors, and guest count. When something changes — for example, a vendor cancels or more guests RSVP — Relay checks the impact, creates recovery options, and updates its plan if another problem happens.

A human always approves the plan before anything is actually changed.

The prototype is based on one example event: **Priya's Wedding**.

* 150 guests
* ₹18,000 budget
* 6 confirmed vendors

---

## Overview

Most event-planning tools mainly show information and wait for a person to fix problems.

Relay works differently. It keeps the event state updated and reacts when something changes.

When a disruption happens, Relay follows this process:

1. Detect the problem
2. Find what is affected
3. Create recovery options using AI
4. Ask a human for approval
5. Execute only approved actions

The main feature is **automatic re-planning**.

For example, if a caterer cancels and Relay is already working on a replacement, but 12 more guests RSVP at the same time, Relay does not start from the beginning. It updates the current plan for the new guest count, recalculates the costs, and gives a new recommendation.

---

## Tech Stack

| Layer                | Technology                           |
| -------------------- | ------------------------------------ |
| Frontend             | React + Vite + Tailwind CSS          |
| API Backend          | Node.js + Express (port `3001`)      |
| Agent Backend        | Python + FastAPI (port `8000`)       |
| LLM                  | OpenAI API                           |
| Structured AI Output | Pydantic                             |
| Database             | MongoDB Atlas                        |
| Real-time Updates    | FastAPI WebSocket (`/ws/{event_id}`) |
| Constraint Engine    | Python deterministic logic           |

### Why are there two backends?

The two backends have different jobs.

**Express** handles:

* MongoDB
* Event data
* Vendor data
* CRUD APIs

**FastAPI** handles:

* Constraint checking
* Impact analysis
* AI reasoning
* Recovery plans
* WebSocket updates
* Approval and execution

FastAPI does not directly write to MongoDB.

The AI only suggests what should be done. A human approves the suggestion, and then a safe execution layer performs the allowed action.

This makes the system safer and easier to control.

---

## Setup / Installation

### Prerequisites

You need:

* Node.js
* Python 3.13+
* MongoDB Atlas connection string
* OpenAI API key

### 1. Configure environment variables

Put your MongoDB connection string in:

```text
backend/api/.env
```

Put your OpenAI API key in:

```text
backend/agent/.env
```

Example:

```text
OPENAI_API_KEY=your_actual_key
```

The OpenAI key should only be used by the agent service.



---

### 2. Install dependencies

#### Express API

```bash
cd backend/api
npm install
```

#### FastAPI Agent

```bash
cd backend/agent
pip install -r requirements.txt
```

#### Frontend

```bash
cd frontend
npm install
```

---

### 3. Seed the database

```bash
python backend/db/seed.py
```

This creates the demo event:

```text
Event: Priya's Wedding
Event ID: evt_1
Guests: 150
Budget: ₹18,000
Spent: ₹17,600
Confirmed Vendors: 6
```

You can run the seed script again whenever you want to reset the demo to its original state.

---

## Running the Project

Start all three services in separate terminals.

### Terminal 1 — Express API

```bash
cd backend/api
npm run dev
```

### Terminal 2 — FastAPI Agent

```bash
cd backend/agent
uvicorn app.main:app --reload --port 8000
```

### Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## Features

### Live Event Dashboard

The dashboard shows:

* Current budget
* Money spent
* Guest count
* Vendor status
* Event status

The data comes from MongoDB through the Express API.

---

### Deterministic Constraint Engine

Relay uses a simple dependency graph to understand what can be affected by a change.

For example:

```text
guest_count
     ↓
catering_requirement
     ↓
catering_cost
     ↓
budget_spent
     ↓
event_status
```

This part does **not** use AI.

The system first calculates the exact impact using normal Python logic.

---

### Impact Analysis

Relay uses BFS to find all the parts of the event that can be affected by a disruption.

For example:

```text
Guest count increases
        ↓
Catering requirement increases
        ↓
Catering cost increases
        ↓
Budget changes
        ↓
Event status may change
```

This gives the AI clear information about what needs to be considered.

---

### Mock Vendor System

The project includes a mock vendor system for the demo.

It can simulate:

* Vendor cancellation
* Quote changes
* Vendor availability

This means the demo does not depend on real vendor APIs.

---

### AI Recovery Planner

When a disruption happens, the FastAPI agent collects:

* Current event state
* Vendor information
* Guest count
* Budget
* Impact analysis
* Details about the disruption

It sends this information to OpenAI.

The AI returns a structured `RecoveryPlan` containing:

* Risk level
* Problem summary
* Recovery options
* Estimated cost
* Tradeoffs
* Recommended option

The response is checked using Pydantic before it is shown to the user.

---

### Human Approval

The AI cannot directly change the event.

The flow is:

```text
AI suggests
    ↓
Human reviews
    ↓
Human approves
    ↓
System executes
```

This keeps the human in control.

---

### Safe Execution

Relay only allows predefined actions.

For example:

```text
replace_catering
reduce_guest_count
```

If the AI sends an unknown action, the system rejects it.

Duplicate approvals are also prevented, so the same action is not executed twice.

---

### Decision Audit Trail

Every recovery decision is recorded.

The record contains information such as:

* Decision status
* Approval status
* Execution status
* Timestamp
* Related disruption

Possible statuses include:

```text
approved
executed
failed
```

This makes it possible to see what Relay decided and what happened afterward.

---

## Autonomous Re-planning

This is the main feature of the project.

Imagine this situation:

1. The confirmed caterer cancels.
2. Relay starts finding a replacement.
3. While the recovery plan is still being worked on, 12 more guests RSVP.
4. Relay detects that a negotiation is already in progress.
5. Instead of creating a completely new plan, Relay updates the current negotiation.
6. Vendor quotes are recalculated for 162 guests.
7. The recovery options are ranked again.
8. Relay shows the new budget tradeoff.
9. A human approves the final option.
10. Relay executes the approved vendor replacement.

This shows that Relay can react to **multiple problems at the same time**.

---

## Real-Time Reasoning Trace

Relay uses a FastAPI WebSocket:

```text
/ws/{event_id}
```

The WebSocket sends agent updates to the frontend in real time.

For example:

```text
Disruption detected
        ↓
Checking event state
        ↓
Running impact analysis
        ↓
Generating recovery options
        ↓
Negotiation in progress
        ↓
Guest count changed: 150 → 162
        ↓
Rescoping negotiation
        ↓
Recalculating costs
        ↓
New recommendation ready
```

This allows the dashboard to show what the agent is doing instead of only showing the final answer.

---

## Technical Workflow

```text
1. A disruption happens
   ↓
2. Current event state is read
   ↓
3. Constraint engine checks the state
   ↓
4. Impact analyzer finds affected parts
   ↓
5. AI creates a structured recovery plan
   ↓
6. A second disruption may arrive
   ↓
7. Relay updates the existing plan
   ↓
8. Human reviews the recommendation
   ↓
9. Human approves the action
   ↓
10. Safe execution layer runs the approved action
   ↓
11. MongoDB is updated
   ↓
12. Decision is saved in the audit trail
   ↓
13. Dashboard receives live updates
```

---

## Demo Scenario

The main demo follows this scenario:

**Priya's Wedding starts with 150 guests and 6 confirmed vendors.**

1. The confirmed caterer is cancelled.
2. Relay detects the vendor problem.
3. The constraint engine checks the impact.
4. Relay generates recovery options.
5. A negotiation starts with a backup caterer.
6. Before the negotiation finishes, 12 more guests RSVP.
7. Relay detects the new guest count: **162**.
8. Instead of starting again, Relay updates the existing negotiation.
9. Catering costs are recalculated for 162 guests.
10. Relay ranks the recovery options again.
11. The user sees the new budget tradeoff.
12. The human approves the backup caterer.
13. Relay executes the approved vendor replacement.
14. The dashboard updates with the new event state.

Everything happens live through the dashboard.

---

## Project Structure

```text
Relay/
├── backend/
│   ├── api/
│   │   └── src/
│   │       └── services/
│   │           └── vendorService.js
│   │
│   ├── agent/
│   │   └── app/
│   │       └── models/
│   │           └── state.py
│   │
│   └── db/
│       └── seed.py
│
└── frontend/
```

### Backend API

Handles MongoDB, events, vendors, and CRUD operations.

### Agent Backend

Handles the constraint engine, impact analysis, AI recovery planning, WebSocket updates, approval, and execution.

### Database

`seed.py` creates the demo event and its starting data.

### Frontend

Contains the React dashboard used to monitor the event and approve recovery actions.

---

## Project Scope

Relay is a **hackathon prototype**, not a production system.

The following parts are intentionally simplified:

* Vendor communication is mocked.
* The demo uses one event.
* There is no user authentication.
* There is no multi-tenant support.
* Vendor APIs are not connected to real companies.

The goal of this project is to prove that the complete loop works:

```text
Detect
  ↓
Analyze
  ↓
Recommend
  ↓
Approve
  ↓
Execute
  ↓
Re-plan
```

The most important part is that Relay can handle a **new disruption while another recovery process is already in progress**.

## Future Implementation

The current version of Relay is a single-event prototype. It was built to prove the main idea: Relay can detect problems, create a recovery plan, get human approval, execute the plan, and re-plan when a new problem happens.

If Relay continues after the hackathon, these would be the next steps.

### Near-term — Make Relay useful for real organizers

* Replace the mock vendor system with real communication through email and SMS providers such as SendGrid or Twilio.
* Add user accounts and multi-event support so one user can manage multiple events.
* Add a permanent decision history and downloadable audit report for each event.
* Allow guests to update their RSVP themselves. Changes in guest count would automatically start the same impact-analysis and recovery process.

### Mid-term — Make Relay smarter

* Add vendor reliability scores based on past results, such as response time, quote accuracy, and whether the vendor completed the agreed work.
* Support more types of problems, such as venue conflicts, date changes, and budget cuts.
* Add different autonomy levels. For example:

  * **Manual:** Always ask the user before taking action.
  * **Assisted:** Suggest and prepare actions, but require approval.
  * **Automatic:** Automatically approve low-risk actions below a set budget.

This would allow users to slowly build trust in the agent.

### Long-term — Product and Business

* Build a B2B version for event agencies and venues managing many events at the same time.
* Connect Relay with existing tools such as calendars, ticketing systems, and CRMs.
* Expand Relay beyond weddings to conferences, corporate events, fundraisers, and other events with similar budget, vendor, and guest dependencies.

### Core Idea

The main architecture would stay the same:

```text
Deterministic Constraint Engine
            +
       AI Recovery Planner
            +
      Human Approval
            +
    Safe Execution Layer
```

The prototype shows that this approach can handle changing event conditions without starting the planning process from scratch. Future versions would mainly add more event types, more data, and more integrations around the same core system.
