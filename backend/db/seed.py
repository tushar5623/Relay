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
    db.events.delete_many({"_id": {"$in": ["evt_1", "evt_2", "evt_3"]}})
    db.vendors.delete_many({"event_id": {"$in": ["evt_1", "evt_2", "evt_3"]}})
    db.guests.delete_many({"event_id": {"$in": ["evt_1", "evt_2", "evt_3"]}})
    db.decisions.delete_many({"event_id": {"$in": ["evt_1", "evt_2", "evt_3"]}})
    
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
            "base_quote": 850000,
            "contact_email": "hello@marigold.com"
        },
        {
            "_id": "gven_2",
            "account_id": "acc_1",
            "category": "music/sound",
            "name": "DJ Smooth (Global)",
            "base_quote": 120000,
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
        "budget_total": 1800000,
        "budget_allocated": {
            "catering": 900000,
            "venue": 400000,
            "photography": 200000,
            "decoration": 110000,
            "music/sound": 90000,
            "transportation": 60000
        },
        "budget_spent": 1760000,
        "status": "on_track",
        "timeline": [
            { "id": "t1", "time": "14:00", "block": "Vendor Load-in", "dependencies": [] },
            { "id": "t2", "time": "16:00", "block": "Guest Arrival", "dependencies": ["t1"] },
            { "id": "t3", "time": "17:00", "block": "Ceremony", "dependencies": ["t2"] },
            { "id": "t4", "time": "19:00", "block": "Dinner Reception", "dependencies": ["t3"] }
        ]
    }

    event2 = {
        "_id": "evt_2",
        "account_id": "acc_1",
        "team": ["usr_2", "usr_3"],
        "name": "Corporate Summit",
        "date": "2026-10-04",
        "guest_count": 300,
        "budget_total": 4500000,
        "budget_allocated": {
            "venue": 2000000,
            "catering": 1500000,
            "av": 1000000
        },
        "budget_spent": 4600000,
        "status": "at_risk",
        "timeline": []
    }

    event3 = {
        "_id": "evt_3",
        "account_id": "acc_1",
        "team": ["usr_1", "usr_2", "usr_3"],
        "name": "Music Festival",
        "date": "2027-05-20",
        "guest_count": 1000,
        "budget_total": 12000000,
        "budget_allocated": {
            "venue": 5000000,
            "music/sound": 7000000
        },
        "budget_spent": 5000000,
        "status": "on_track",
        "timeline": []
    }

    db.events.insert_many([event, event2, event3])

    # 4. Insert vendors
    vendors = [
        {
            "_id": "ven_catering_1",
            "event_id": "evt_1",
            "category": "catering",
            "name": "Saffron Table Catering",
            "status": "confirmed",
            "quote": 900000,
            "contact_log": []
        },
        {
            "_id": "ven_venue_1",
            "event_id": "evt_1",
            "category": "venue",
            "name": "The Grand Hall",
            "status": "confirmed",
            "quote": 400000,
            "contact_log": []
        },
        {
            "_id": "ven_photo_1",
            "event_id": "evt_1",
            "category": "photography",
            "name": "Lens & Light",
            "status": "confirmed",
            "quote": 200000,
            "contact_log": []
        },
        {
            "_id": "ven_decor_1",
            "event_id": "evt_1",
            "category": "decoration",
            "name": "Floral Designs by Lily",
            "status": "confirmed",
            "quote": 110000,
            "contact_log": []
        },
        {
            "_id": "ven_music_1",
            "event_id": "evt_1",
            "category": "music/sound",
            "name": "DJ Beats",
            "status": "confirmed",
            "quote": 90000,
            "contact_log": []
        },
        {
            "_id": "ven_transport_1",
            "event_id": "evt_1",
            "category": "transportation",
            "name": "City Limos",
            "status": "confirmed",
            "quote": 60000,
            "contact_log": []
        },
        {
            "_id": "ven_av_2",
            "event_id": "evt_2",
            "category": "av",
            "name": "TechAudio Corp",
            "status": "cancelled",
            "quote": 1000000,
            "contact_log": []
        },
        {
            "_id": "ven_music_3",
            "event_id": "evt_3",
            "category": "music/sound",
            "name": "MainStage Audio",
            "status": "confirmed",
            "quote": 7000000,
            "contact_log": []
        }
    ]
    db.vendors.insert_many(vendors)

    # 5. Insert guests
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
    print(" - Inserted events: 3")
    print(" - Inserted vendors: 8")
    print(" - Inserted guests: 150")
    print(" - Inserted accounts: 1")
    print(" - Inserted users: 3")
    print(" - Inserted global_vendors: 2")
    print(" - Decisions collection left empty for evt_1")

if __name__ == "__main__":
    seed_database()
