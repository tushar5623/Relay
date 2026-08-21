import os
import sys
from pathlib import Path
from pymongo import MongoClient

try:
    from dotenv import load_dotenv
    # Look for .env in the project root first, then api or agent folders
    current_dir = Path(__file__).resolve().parent
    root_env = current_dir.parent.parent / '.env'
    api_env = current_dir.parent / 'api' / '.env'
    agent_env = current_dir.parent / 'agent' / '.env'

    if root_env.exists():
        load_dotenv(root_env)
    elif api_env.exists():
        load_dotenv(api_env)
    elif agent_env.exists():
        load_dotenv(agent_env)
    else:
        # Fallback to default search
        load_dotenv()
except ImportError:
    print("python-dotenv not installed. Skipping .env file load.")

def seed_database():
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        print("Error: MONGODB_URI environment variable is missing. Please check your .env configuration.")
        sys.exit(1)
    
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
    except Exception as e:
        print(f"Failed to connect to MongoDB at {uri}. Error: {e}")
        sys.exit(1)

    db = client.get_database()
    print(f"Connected to database: {db.name}")

    # 1. Clear prototype collections
    db.events.delete_many({"_id": "evt_1"})
    db.vendors.delete_many({"event_id": "evt_1"})
    db.guests.delete_many({"event_id": "evt_1"})
    db.decisions.delete_many({"event_id": "evt_1"})
    
    # 2. Clear foundation collections
    db.accounts.delete_many({"_id": "acc_1"})
    db.users.delete_many({"account_id": "acc_1"})
    db.global_vendors.delete_many({"account_id": "acc_1"})

    # 3. Create indexes
    # Ensure a global vendor can only be assigned to the same event once.
    # partialFilterExpression ensures it only applies to documents that have a global_vendor_id
    db.vendors.create_index(
        [("event_id", 1), ("global_vendor_id", 1)],
        unique=True,
        partialFilterExpression={"global_vendor_id": {"$exists": True}}
    )

    # 2.6 Seed foundation collections
    db.accounts.insert_one({
        "_id": "acc_1",
        "name": "Default Prototype Account",
        "plan": "enterprise"
    })

    users = [
        {
            "_id": "usr_1",
            "name": "Alice Planner",
            "email": "alice@example.com",
            "role": "planner",
            "account_id": "acc_1",
            "active": True
        },
        {
            "_id": "usr_2",
            "name": "Bob Approver",
            "email": "bob@example.com",
            "role": "approver",
            "account_id": "acc_1",
            "active": True
        },
        {
            "_id": "usr_3",
            "name": "Charlie Admin",
            "email": "charlie@example.com",
            "role": "admin",
            "account_id": "acc_1",
            "active": True
        }
    ]
    db.users.insert_many(users)

    global_vendors = [
        {
            "_id": "gven_1",
            "account_id": "acc_1",
            "category": "catering",
            "name": "Marigold Catering (Global)",
            "base_quote": 8500,
            "contact_email": "hello@marigold.com"
        },
        {
            "_id": "gven_2",
            "account_id": "acc_1",
            "category": "music/sound",
            "name": "DJ Smooth (Global)",
            "base_quote": 1200,
            "contact_email": "booking@djsmooth.com"
        }
    ]
    db.global_vendors.insert_many(global_vendors)
    
    # 3. Insert initial event
    event = {
        "_id": "evt_1",
        "account_id": "acc_1",
        "team": ["usr_1", "usr_2"],
        "name": "Priya's Wedding",
        "date": "2026-09-12",
        "guest_count": 150,
        "budget_total": 18000,
        "budget_allocated": {
            "catering": 9000,
            "venue": 4000,
            "photography": 2000,
            "decoration": 1100,
            "music/sound": 900,
            "transportation": 600
        },
        "budget_spent": 17600,
        "status": "on_track",
        "timeline": [
            { "id": "t1", "time": "14:00", "block": "Vendor Load-in", "dependencies": [] },
            { "id": "t2", "time": "16:00", "block": "Guest Arrival", "dependencies": ["t1"] },
            { "id": "t3", "time": "17:00", "block": "Ceremony", "dependencies": ["t2"] },
            { "id": "t4", "time": "19:00", "block": "Dinner Reception", "dependencies": ["t3"] }
        ]
    }
    db.events.insert_one(event)

    # 4. Insert 6 confirmed vendors
    vendors = [
        {
            "_id": "ven_catering_1",
            "event_id": "evt_1",
            "category": "catering",
            "name": "Saffron Table Catering",
            "status": "confirmed",
            "quote": 9000,
            "contact_log": []
        },
        {
            "_id": "ven_venue_1",
            "event_id": "evt_1",
            "category": "venue",
            "name": "The Grand Hall",
            "status": "confirmed",
            "quote": 4000,
            "contact_log": []
        },
        {
            "_id": "ven_photo_1",
            "event_id": "evt_1",
            "category": "photography",
            "name": "Lens & Light",
            "status": "confirmed",
            "quote": 2000,
            "contact_log": []
        },
        {
            "_id": "ven_decor_1",
            "event_id": "evt_1",
            "category": "decoration",
            "name": "Floral Designs by Lily",
            "status": "confirmed",
            "quote": 1100,
            "contact_log": []
        },
        {
            "_id": "ven_music_1",
            "event_id": "evt_1",
            "category": "music/sound",
            "name": "DJ Beats",
            "status": "confirmed",
            "quote": 900,
            "contact_log": []
        },
        {
            "_id": "ven_transport_1",
            "event_id": "evt_1",
            "category": "transportation",
            "name": "City Limos",
            "status": "confirmed",
            "quote": 600,
            "contact_log": []
        }
    ]
    db.vendors.insert_many(vendors)

    # 5. Insert 150 guest records
    guests = []
    for i in range(1, 151):
        guests.append({
            "_id": f"guest_{i}",
            "event_id": "evt_1",
            "name": f"Guest {i}",
            "rsvp_status": "attending" if i <= 130 else "pending",
            "notified": False
        })
    db.guests.insert_many(guests)

    print("Seed complete successfully.")
    print(" - Inserted event: evt_1 (with account_id & team)")
    print(" - Inserted vendors: 6")
    print(" - Inserted guests: 150")
    print(" - Inserted accounts: 1")
    print(" - Inserted users: 3")
    print(" - Inserted global_vendors: 2")
    print(" - Decisions collection left empty for evt_1")

if __name__ == "__main__":
    seed_database()
