const { getDb } = require('../db/connection');
const { v4: uuidv4 } = require('uuid');

async function getGlobalVendors(req, res) {
    try {
        const db = getDb();
        const accountId = req.user.account_id;
        const query = { account_id: accountId };
        
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.active !== undefined) {
            query.active = req.query.active === 'true';
        }

        const vendors = await db.collection('global_vendors').find(query).toArray();
        res.json(vendors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function getGlobalVendor(req, res) {
    try {
        const db = getDb();
        const vendor = await db.collection('global_vendors').findOne({ _id: req.params.id, account_id: req.user.account_id });
        if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
        res.json(vendor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function createGlobalVendor(req, res) {
    try {
        const db = getDb();
        const newVendor = {
            _id: `gven_${uuidv4().replace(/-/g, '').substring(0,8)}`,
            account_id: req.user.account_id,
            name: req.body.name || 'Unnamed Vendor',
            category: req.body.category || 'other',
            contact_email: req.body.contact_email || '',
            base_quote: Number(req.body.base_quote) || 0,
            active: true,
            performance_notes: req.body.performance_notes || [],
            cost_history: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await db.collection('global_vendors').insertOne(newVendor);
        res.status(201).json(newVendor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateGlobalVendor(req, res) {
    try {
        const db = getDb();
        const updates = { ...req.body, updated_at: new Date().toISOString() };
        delete updates._id;
        delete updates.account_id;

        // If appending a performance note
        let updateQuery = { $set: updates };
        if (req.body.new_note) {
            delete updates.new_note;
            updateQuery = { 
                $set: updates, 
                $push: { performance_notes: { note: req.body.new_note, date: new Date().toISOString(), user_id: req.user._id } } 
            };
        }

        const result = await db.collection('global_vendors').findOneAndUpdate(
            { _id: req.params.id, account_id: req.user.account_id },
            updateQuery,
            { returnDocument: 'after' }
        );

        if (!result) return res.status(404).json({ error: 'Vendor not found' });
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function associateWithEvent(req, res) {
    try {
        const db = getDb();
        const eventId = req.body.event_id;
        const quote = Number(req.body.quote);
        
        if (!eventId || isNaN(quote)) {
            return res.status(400).json({ error: 'event_id and valid quote are required' });
        }

        const gVendor = await db.collection('global_vendors').findOne({ _id: req.params.id, account_id: req.user.account_id });
        if (!gVendor) return res.status(404).json({ error: 'Global vendor not found' });

        // Check if already assigned to this event
        const existingAssociation = await db.collection('vendors').findOne({
            event_id: eventId,
            global_vendor_id: gVendor._id
        });
        
        if (existingAssociation) {
            return res.status(409).json({ error: 'Vendor is already assigned to this event.' });
        }

        // Clone to local vendors collection
        const localVendor = {
            _id: `ven_${gVendor.category}_${uuidv4().substring(0,6)}`,
            event_id: eventId,
            global_vendor_id: gVendor._id,
            category: gVendor.category,
            name: gVendor.name,
            status: 'confirmed',
            quote: quote,
            contact_log: []
        };
        await db.collection('vendors').insertOne(localVendor);

        // Update cost history globally
        await db.collection('global_vendors').updateOne(
            { _id: gVendor._id },
            { $push: { cost_history: { event_id: eventId, quote: quote, date: new Date().toISOString() } } }
        );

        res.json({ message: 'Vendor associated successfully', vendor: localVendor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getGlobalVendors,
    getGlobalVendor,
    createGlobalVendor,
    updateGlobalVendor,
    associateWithEvent
};
