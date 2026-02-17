const API_URL = 'http://localhost:5000/api';

export const getAiDashboard = async (businessId, granularity) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/businesses/${businessId}/ai/dashboard?granularity=${granularity}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return await response.json();
};

export const getCsvAnalysis = async (businessId, granularity) => {
    const token = localStorage.getItem('token');
    // For now, this can reuse the dashboard endpoint or a specific one if needed.
    // Assuming CSV analysis is part of the main dashboard or similar.
    // The user code calls this separately, so let's make a separate endpoint call or mock it for now.
    // It seems to expect "total_stats" and "insights".
    // I will map it to the same dashboard endpoint but maybe with a flag?
    // Or just a separate endpoint. Let's start with a placeholder that returns valid structure.
    try {
        const response = await fetch(`${API_URL}/businesses/${businessId}/ai/csv-analysis?granularity=${granularity}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) return await response.json();
    } catch (e) {
        console.warn("CSV Analysis endpoint not ready", e);
    }

    return {
        total_stats: { margin: 0 },
        insights: ["CSV analysis pending backend implementation."]
    };
};

export const exportReportExcel = async (businessId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/businesses/${businessId}/export/excel`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to export Excel');
    return await response.blob();
};

export const exportReportPdf = async (businessId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/businesses/${businessId}/export/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to export PDF');
    return await response.blob();
};

export const exportAiData = async (businessId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/businesses/${businessId}/export/ai-data`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to export AI Data');
    return await response.json();
};
