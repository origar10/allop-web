import { apiGet } from '../shared/apiClient';
import type { MapKitTokenResponse } from '../shared/apiContracts';

export async function getMapKitToken() {
  const data = await apiGet<MapKitTokenResponse>('/mapkit/token', { timeoutMs: 8000 });
  return data.token;
}
