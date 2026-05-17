import { CouponCandidate } from '../types';
import { scrapeAllCouponSites } from './scrapers/couponSites';
import { analyzeShopPage } from './scrapers/shopPageAnalyzer';
import { searchWebForCoupons } from './scrapers/webSearch';
import { generatePatternCandidates } from './scrapers/patternGenerator';

export interface RealSourceResult {
  candidates: CouponCandidate[];
  sourceBreakdown: Record<string, number>;
  durationMs: number;
}

export async function fetchFromRealSources(
  domain: string,
  shopUrl: string,
  shopName: string,
): Promise<RealSourceResult> {
  const start = Date.now();

  // All sources run in parallel
  const [siteResults, shopPageResults, webSearchResults] = await Promise.allSettled([
    scrapeAllCouponSites(domain),
    analyzeShopPage(shopUrl),
    searchWebForCoupons(domain, shopName),
  ]);

  const fromSites = siteResults.status === 'fulfilled' ? siteResults.value : [];
  const fromShopPage = shopPageResults.status === 'fulfilled' ? shopPageResults.value : [];
  const fromWebSearch = webSearchResults.status === 'fulfilled' ? webSearchResults.value : [];
  const fromPatterns = generatePatternCandidates(domain, shopName);

  const allCandidates = [
    ...fromShopPage,   // highest priority — from the shop itself
    ...fromSites,      // coupon aggregators
    ...fromWebSearch,  // web search snippets
    ...fromPatterns,   // pattern-based (lowest confidence)
  ];

  const sourceBreakdown: Record<string, number> = {};
  for (const c of allCandidates) {
    sourceBreakdown[c.sourceName] = (sourceBreakdown[c.sourceName] ?? 0) + 1;
  }

  return {
    candidates: allCandidates,
    sourceBreakdown,
    durationMs: Date.now() - start,
  };
}
