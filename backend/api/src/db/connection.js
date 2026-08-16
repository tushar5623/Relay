const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectToDatabase() {
    if (db) return db;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn("MONGODB_URI environment variable is missing. Database operations will fail if attempted.");
        return null;
    }

    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(); // Uses the DB from the URI
        console.log("Connected to MongoDB");
        return db;
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        throw err;
    }
}

function getDb() {
    if (!db) {
        throw new Error("Database not connected. Please ensure MONGODB_URI is set.");
    }
    return db;
}

module.exports = { connectToDatabase, getDb };
