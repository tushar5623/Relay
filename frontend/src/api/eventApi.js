const API_BASE_URL = 'http://localhost:3001';

function getHeaders(baseHeaders = {}) {
    const userId = localStorage.getItem('relay_active_user');
    const headers = { ...baseHeaders };
    if (userId) {
        headers['X-User-Id'] = userId;
    }
    return headers;
}

export async function getEvents() {
    const res = await fetch(`${API_BASE_URL}/event`, { headers: getHeaders() });
    if (!res.ok) {
        throw new Error('Failed to fetch events');
    }
    return res.json();
}

export async function getEvent(eventId) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}`, {
        headers: getHeaders()
    });
    if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden: You do not have access to this event');
        throw new Error('Failed to fetch event data');
    }
    return res.json();
}

export async function updateEventBudget(eventId, budgetData) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/budget`, {
        method: 'PATCH',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(budgetData)
    });
    if (!res.ok) {
        throw new Error('Failed to update budget');
    }
    return res.json();
}

// --- Global Vendor APIs ---

export async function getGlobalVendors(category, active) {
    let url = `${API_BASE_URL}/global-vendors?`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (active !== undefined) url += `active=${active}`;
    
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch global vendors');
    return res.json();
}

export async function createGlobalVendor(data) {
    const res = await fetch(`${API_BASE_URL}/global-vendors`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create global vendor');
    return res.json();
}

export async function updateGlobalVendor(vendorId, data) {
    const res = await fetch(`${API_BASE_URL}/global-vendors/${vendorId}`, {
        method: 'PATCH',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update global vendor');
    return res.json();
}

export async function associateGlobalVendor(vendorId, eventId, quote) {
    const res = await fetch(`${API_BASE_URL}/global-vendors/${vendorId}/associate`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ event_id: eventId, quote })
    });
    if (!res.ok) throw new Error('Failed to associate global vendor');
    return res.json();
}

export async function updateVendor(eventId, vendorId, vendorData) {
    let lastResult = null;
    if (vendorData.status !== undefined) {
        const res = await fetch(`${API_BASE_URL}/event/${eventId}/vendor/${vendorId}/status`, {
            method: 'PATCH',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status: vendorData.status })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update vendor status');
        }
        lastResult = await res.json();
    }
    if (vendorData.quote !== undefined) {
        const res = await fetch(`${API_BASE_URL}/event/${eventId}/vendor/${vendorId}/quote`, {
            method: 'PATCH',
            headers: getHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ quote: vendorData.quote })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update vendor quote');
        }
        lastResult = await res.json();
    }
    return lastResult || { message: 'Vendor updated successfully' };
}

export async function cancelVendor(eventId, vendorId) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/vendor/${vendorId}/cancel`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' })
    });
    if (!res.ok) {
        throw new Error('Failed to cancel vendor');
    }
    return res.json();
}

export async function generateRecoveryPlan(eventId, disruptionData) {
    const res = await fetch(`http://localhost:8000/plan/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disruptionData)
    });
    if (!res.ok) {
        throw new Error('Failed to generate recovery plan');
    }
    return res.json();
}

export async function getDecisions(eventId) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/decisions`, {
        headers: getHeaders()
    });
    if (!res.ok) {
        throw new Error('Failed to fetch decisions');
    }
    return res.json();
}

export async function executeDecision(eventId, optionId, disruptionData, optionData = null) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/decisions`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
            option_id: optionId,
            disruption: disruptionData,
            option_data: optionData
        })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to execute decision');
    }
    return res.json();
}

export async function incrementHeadcount(eventId, delta) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/headcount`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ delta })
    });
    if (!res.ok) {
        throw new Error('Failed to increment headcount');
    }
    return res.json();
}

export async function reportDisruption(eventId, disruptionData) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/disruptions`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(disruptionData)
    });
    if (!res.ok) {
        throw new Error('Failed to report disruption');
    }
    return res.json();
}

export async function getDisruptions(eventId) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/disruptions`, {
        headers: getHeaders()
    });
    if (!res.ok) {
        throw new Error('Failed to fetch disruptions');
    }
    return res.json();
}

export async function importData(eventId, data) {
    const res = await fetch(`${API_BASE_URL}/event/${eventId}/import`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to import data');
    }
    return res.json();
}

// --- Notification APIs ---
export async function getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
}

export async function markNotificationAsRead(id) {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
}

export async function markAllNotificationsAsRead() {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark all notifications as read');
    return res.json();
}
