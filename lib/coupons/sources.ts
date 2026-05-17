import { CouponCandidate } from '../types';
import { fetchFromRealSources, RealSourceResult } from './realSources';
import { MOCK_COUPON_DATABASE } from '../../data/mock-coupons';

export interface SourceResult {
  candidates: CouponCandidate[];
  sourceBreakdown: Record<string, number>;
  usedFallback: boolean;
  durationMs: number;
}

export async function fetchCoupons(
  domain: string,
  shopUrl: string,
  shopName: string,
): Promise<SourceResult> {
  // Always run real sources
  const real: RealSourceResult = await fetchFromRealSources(domain, shopUrl, shopName);

  // Supplement with mock data for known shops (ensures demo always has rich data)
  const domainKey = domain.replace(/^www\./, '');
  const mockCandidates = MOCK_COUPON_DATABASE[domainKey] ?? [];

  const combined = [...real.candidates, ...mockCandidates];

  const breakdown = { ...real.sourceBreakdown };
  for (const c of mockCandidates) {
    breakdown[c.sourceName] = (breakdown[c.sourceName] ?? 0) + 1;
  }

  return {
    candidates: combined,
    sourceBreakdown: breakdown,
    usedFallback: real.candidates.length === 0,
    durationMs: real.durationMs,
  };
}
