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

    # 2. Clear prototype collections
    db.events.delete_many({"_id": "evt_1"})
    db.vendors.delete_many({"event_id": "evt_1"})
    db.guests.delete_many({"event_id": "evt_1"})
    # Let's just clear all decisions for evt_1
    db.decisions.delete_many({"event_id": "evt_1"})
    
    # 3. Insert initial event
    event = {
        "_id": "evt_1",
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
        "status": "on_track"
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
    print(" - Inserted event: evt_1")
    print(" - Inserted vendors: 6")
    print(" - Inserted guests: 150")
    print(" - Decisions collection left empty for evt_1")

if __name__ == "__main__":
    seed_database()
