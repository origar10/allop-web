const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://api.allop.es/api').replace(/\/$/, '');
const LEADS_KEY = 'allop.business.leads';

export interface BusinessLead {
  salonName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  teamSize: string;
  message: string;
  source: string;
  createdAt: string;
}

function storeLead(lead: BusinessLead) {
  const current = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]') as BusinessLead[];
  localStorage.setItem(LEADS_KEY, JSON.stringify([lead, ...current]));
}

export async function submitBusinessLead(lead: BusinessLead) {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/b2b`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) throw new Error('CRM no disponible.');

    return { storedLocally: false };
  } catch {
    storeLead(lead);
    return { storedLocally: true };
  }
}
