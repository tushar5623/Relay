import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Load env variables reliably
current_dir = Path(__file__).resolve().parent
root_env = current_dir.parent.parent.parent / '.env'
api_env = current_dir.parent.parent / 'api' / '.env'
agent_env = current_dir.parent / '.env'

if root_env.exists():
    load_dotenv(root_env)
elif api_env.exists():
    load_dotenv(api_env)
elif agent_env.exists():
    load_dotenv(agent_env)
else:
    load_dotenv()

client = None
db = None

def get_db():
    global client, db
    if db is not None:
        return db
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        raise ValueError("MONGODB_URI is not set. Cannot connect to database.")
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    db = client.get_database()
    return db
