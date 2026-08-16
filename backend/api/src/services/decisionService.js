const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');

async function getDecisions(eventId) {
    const db = getDb();
    return await db.collection('decisions').find({ event_id: eventId }).sort({ created_at: -1 }).toArray();
}

async function createAndExecuteDecision(eventId, optionId, disruption, optionData = null) {
    const db = getDb();
    
    // 1. Idempotency check: prevent duplicate execution for the same active disruption
    const existing = await db.collection('decisions').findOne({
        event_id: eventId,
        option_id: optionId,
        'disruption.vendor_id': disruption.vendor_id,
        'disruption.type': disruption.type
    });
    
    if (existing && existing.status === 'executed') {
        return existing;
    }
    
    // 2. Create decision with status 'approved'
    const decisionId = new ObjectId().toString();
    const decision = {
        _id: decisionId,
        decision_id: decisionId,
        event_id: eventId,
        option_id: optionId,
        status: 'approved',
        approved_by: 'human',
        disruption: disruption,
        created_at: new Date().toISOString(),
        executed_at: null,
        result: null
    };
    
    await db.collection('decisions').insertOne(decision);
    
    try {
        let result = null;
        
        // 3. Map option_id to deterministic action
        if (optionId.startsWith('opt_') || optionId === 'replace_catering') {
            // ACTION A — REPLACE CATERING DYNAMICALLY
            const vendorName = (optionData && optionData.title) ? optionData.title : 'Backup Catering Co.';
            const vendorQuote = (optionData && optionData.estimated_cost_change) ? optionData.estimated_cost_change : 9000;
            
            const backupVendor = {
                _id: `ven_backup_${new ObjectId().toString()}`,
                event_id: eventId,
                name: vendorName,
                category: disruption.type === 'vendor_cancellation' ? 'catering' : 'unknown',
                status: 'confirmed',
                quote: vendorQuote,
                is_mock: true
            };
            
            await db.collection('vendors').insertOne(backupVendor);
            
            // Recalculate dynamic budget
            const confirmedVendors = await db.collection('vendors').find({ event_id: eventId, status: 'confirmed' }).toArray();
            const newBudgetSpent = confirmedVendors.reduce((sum, v) => sum + (v.quote || 0), 0);
            
            await db.collection('events').updateOne(
                { _id: eventId },
                { $set: { budget_spent: newBudgetSpent } }
            );
            
            result = { message: `${vendorName} confirmed and budget recalculated to $${newBudgetSpent}` };
            
        } else if (optionId === 'reduce_guest_count') {
            // ACTION B — MODIFY GUEST COUNT
            await db.collection('events').updateOne(
                { _id: eventId },
                { $set: { guest_count: 120 } }
            );
            result = { message: 'Guest count reduced to 120' };
            
        } else {
            throw new Error('Unknown option_id provided. Execution rejected.');
        }
        
        // 4. Update to executed
        decision.status = 'executed';
        decision.executed_at = new Date().toISOString();
        decision.result = result;
        
        await db.collection('decisions').updateOne(
            { _id: decisionId },
            { $set: { status: 'executed', executed_at: decision.executed_at, result: decision.result } }
        );
        
        return decision;
        
    } catch (error) {
        // 5. Update to failed
        decision.status = 'failed';
        decision.result = { error: error.message };
        
        await db.collection('decisions').updateOne(
            { _id: decisionId },
            { $set: { status: 'failed', result: decision.result } }
        );
        
        return decision;
    }
}

module.exports = {
    getDecisions,
    createAndExecuteDecision
};
