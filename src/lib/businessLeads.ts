import { apiPost } from '../shared/apiClient';

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
    await apiPost('/leads/b2b', lead);
    return { storedLocally: false };
  } catch {
    storeLead(lead);
    return { storedLocally: true };
  }
}
