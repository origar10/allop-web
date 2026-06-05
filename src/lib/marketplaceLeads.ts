const MARKETPLACE_LEADS_KEY = 'allop.marketplace.leads';

export interface MarketplaceLead {
  type: 'no_results' | 'suggest_salon' | 'claim_listing';
  name: string;
  phone: string;
  email: string;
  city: string;
  message: string;
  query?: string;
  createdAt: string;
}

export function saveMarketplaceLead(lead: MarketplaceLead) {
  const current = JSON.parse(localStorage.getItem(MARKETPLACE_LEADS_KEY) || '[]') as MarketplaceLead[];
  localStorage.setItem(MARKETPLACE_LEADS_KEY, JSON.stringify([lead, ...current]));
}
