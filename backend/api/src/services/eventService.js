const { getDb } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

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

async function importEventData(eventId, domain, records, accountId) {
    const db = getDb();
    
    if (domain === 'budget') {
        const updates = {};
        let addedTotal = 0;
        for (const r of records) {
            const amount = parseFloat(r.amount);
            if (!isNaN(amount) && r.category) {
                updates[`budget_allocated.${r.category}`] = amount;
                addedTotal += amount;
            }
        }
        await db.collection('events').updateOne({ _id: eventId }, { $set: updates, $inc: { budget_total: addedTotal } });
        return { imported_budget_lines: records.length };
    } 
    else if (domain === 'vendors') {
        const vendorsToInsert = [];
        const globalVendorsToInsert = [];
        
        for (const r of records) {
            const quote = parseFloat(r.quote) || 0;
            const category = r.category || 'unknown';
            const name = r.name || 'Unnamed Vendor';
            
            let globalVendorId = null;
            if (accountId) {
                // Check if global vendor already exists by name
                let gVendor = await db.collection('global_vendors').findOne({ account_id: accountId, name: name });
                if (!gVendor) {
                    globalVendorId = `gven_imp_${uuidv4().replace(/-/g, '').substring(0,8)}`;
                    const newGlobalVendor = {
                        _id: globalVendorId,
                        account_id: accountId,
                        name: name,
                        category: category,
                        contact_email: r.contact || '',
                        base_quote: quote,
                        active: true,
                        performance_notes: [],
                        cost_history: [{ event_id: eventId, quote: quote, date: new Date().toISOString() }],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    globalVendorsToInsert.push(newGlobalVendor);
                } else {
                    globalVendorId = gVendor._id;
                    await db.collection('global_vendors').updateOne(
                        { _id: globalVendorId },
                        { $push: { cost_history: { event_id: eventId, quote: quote, date: new Date().toISOString() } } }
                    );
                }
            }

            vendorsToInsert.push({
                _id: `ven_import_${uuidv4().replace(/-/g, '').substring(0,8)}`,
                event_id: eventId,
                global_vendor_id: globalVendorId,
                category: category,
                name: name,
                status: r.status || 'pending',
                quote: quote,
                contact_log: []
            });
        }

        if (globalVendorsToInsert.length > 0) {
            await db.collection('global_vendors').insertMany(globalVendorsToInsert);
        }
        
        if (vendorsToInsert.length > 0) {
            await db.collection('vendors').insertMany(vendorsToInsert);
        }
        return { imported_vendors: vendorsToInsert.length };
    }
    else if (domain === 'timeline') {
        const blocks = records.map(r => ({
            id: r.id || uuidv4().substring(0,8),
            time: r.time || '',
            block: r.block || 'Event Activity',
            dependencies: r.dependencies ? r.dependencies.split('|') : []
        }));
        await db.collection('events').updateOne({ _id: eventId }, { $push: { timeline: { $each: blocks } } });
        return { imported_timeline_blocks: blocks.length };
    }
    else {
        throw new Error(`Unsupported domain: ${domain}`);
    }
}

module.exports = {
    getEventWithDetails,
    updateEventBudget,
    updateVendor,
    incrementHeadcount,
    importEventData
};
