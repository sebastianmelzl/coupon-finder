import { CouponCandidate } from '../types';
import {
  MOCK_COUPON_DATABASE,
  GENERIC_FALLBACK_CODES,
} from '../../data/mock-coupons';

export interface SourceResult {
  candidates: CouponCandidate[];
  errors: string[];
  usedFallback: boolean;
}

export async function fetchCoupons(domain: string): Promise<SourceResult> {
  // Simulate realistic network latency
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));

  const key = domain.replace(/^www\./, '');
  const known = MOCK_COUPON_DATABASE[key];

  if (known !== undefined && known.length > 0) {
    return { candidates: known, errors: [], usedFallback: false };
  }

  // For unknown shops, return generic codes with low confidence
  return {
    candidates: GENERIC_FALLBACK_CODES,
    errors: [],
    usedFallback: true,
  };
}

/*
 * Stub for future real-source integration.
 * Implement one function per source; each must respect robots.txt and ToS.
 */
export async function fetchFromPublicSource(
  _sourceName: string,
  _domain: string,
): Promise<CouponCandidate[]> {
  throw new Error(
    'Real source integration not implemented. Use fetchCoupons() for mock data.',
  );
}
