const { getDb } = require('../db/connection');
const { ObjectId } = require('mongodb');
const notificationService = require('./notificationService');

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
        result: null,
        original_ai_recommendation: optionData ? optionData.title : null,
        human_edited: false, // We'll assume false for now unless we add an edit field
        final_action: null,
        final_cost: null,
        final_time_to_resolution: null,
        follow_up_actions: []
    };
    
    await db.collection('decisions').insertOne(decision);
    
    // Feature 10: Create Notification for Action B (Approval)
    const event = await db.collection('events').findOne({ _id: eventId });
    if (event) {
        await notificationService.createNotification(
            event.account_id,
            eventId,
            'recovery_approved',
            'Recovery Approved',
            `A recovery action has been approved for ${event.name}.`,
            'info',
            ['admin', 'approver', 'planner']
        );
    }
    
    try {
        let result = null;
        let vendorQuoteToLog = null;
        
        // 3. Map option_id to deterministic action
        if (optionId.startsWith('opt_') || optionId === 'replace_catering') {
            // ACTION A — REPLACE CATERING DYNAMICALLY
            const vendorName = (optionData && optionData.title) ? optionData.title : 'Backup Catering Co.';
            const vendorQuote = (optionData && optionData.estimated_cost_change) ? optionData.estimated_cost_change : 9000;
            vendorQuoteToLog = vendorQuote;
            
            const isLegacyTest = optionId === 'replace_catering';
            const backupVendor = {
                _id: isLegacyTest ? 'ven_backup_catering_1' : `ven_backup_${new ObjectId().toString()}`,
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
            
            result = { message: `${vendorName} confirmed and budget recalculated to ₹${newBudgetSpent}` };
            
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

        const draftEmail = `Subject: Notification regarding event ${eventId}\n\nDear team/vendor,\nPlease be advised of the recent changes: ${result.message}\n\nThanks,\nEvent Operations`;

        decision.final_action = result.message;
        decision.final_cost = vendorQuoteToLog || null;
        decision.final_time_to_resolution = null;
        decision.follow_up_actions = [
            { type: 'vendor_email_draft', content: draftEmail },
            { type: 'team_notification', content: `Automated alert: ${result.message}` },
            { type: 'timeline_update', content: 'Timeline block needs review.' }
        ];
        
        decision.status = 'executed';
        decision.executed_at = new Date().toISOString();
        decision.result = result;
        
        await db.collection('decisions').updateOne(
            { _id: decisionId },
            { $set: decision }
        );
        
        // Feature 10: Create Notification for Action C (Execution)
        if (event) {
            await notificationService.createNotification(
                event.account_id,
                eventId,
                'recovery_executed',
                'Recovery Executed',
                `${decision.final_action}`,
                'info',
                ['admin', 'approver', 'planner']
            );
        }
        
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
