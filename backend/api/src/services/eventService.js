const { getDb } = require('../db/connection');

async function getEventWithDetails(eventId) {
    const db = getDb();
    
    const event = await db.collection('events').findOne({ _id: eventId });
    if (!event) {
        return null;
    }

    const vendors = await db.collection('vendors').find({ event_id: eventId }).toArray();
    const guests = await db.collection('guests').find({ event_id: eventId }).toArray();

    return {
        event,
        vendors,
        guests
    };
}

async function updateEventBudget(eventId, budgetData) {
    const db = getDb();
    
    // Basic validation
    if (budgetData.budget_total !== undefined && typeof budgetData.budget_total !== 'number') {
        throw new Error('budget_total must be a number');
    }

    const updateFields = {};
    if (budgetData.budget_total !== undefined) updateFields.budget_total = budgetData.budget_total;
    if (budgetData.budget_spent !== undefined) updateFields.budget_spent = budgetData.budget_spent;
    if (budgetData.budget_allocated !== undefined) updateFields.budget_allocated = budgetData.budget_allocated;

    if (Object.keys(updateFields).length === 0) {
        return null;
    }

    const result = await db.collection('events').findOneAndUpdate(
        { _id: eventId },
        { $set: updateFields },
        { returnDocument: 'after' }
    );

    return result;
}

async function updateVendor(eventId, vendorId, vendorData) {
    const db = getDb();
    
    const updateFields = {};
    if (vendorData.status !== undefined) updateFields.status = vendorData.status;
    if (vendorData.quote !== undefined) {
        if (typeof vendorData.quote !== 'number') throw new Error('quote must be a number');
        updateFields.quote = vendorData.quote;
    }

    if (Object.keys(updateFields).length === 0) {
        return null;
    }

    const result = await db.collection('vendors').findOneAndUpdate(
        { _id: vendorId, event_id: eventId },
        { $set: updateFields },
        { returnDocument: 'after' }
    );

    return result;
}

async function incrementHeadcount(eventId, delta) {
    const db = getDb();
    if (typeof delta !== 'number') {
        throw new Error('delta must be a number');
    }

    const result = await db.collection('events').findOneAndUpdate(
        { _id: eventId },
        { $inc: { guest_count: delta } },
        { returnDocument: 'after' }
    );

    // Ping FastAPI to trigger rescope if negotiation is active
    try {
        await fetch(`http://localhost:8000/agent/${eventId}/rescope`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delta })
        });
    } catch (e) {
        console.error("FastAPI rescope failed (might not be active):", e.message);
    }

    return result;
}

module.exports = {
    getEventWithDetails,
    updateEventBudget,
    updateVendor,
    incrementHeadcount
};
