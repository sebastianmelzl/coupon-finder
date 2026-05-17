import { CouponCandidate, CouponAggregate, CouponSource, SourceQuality } from '../types';

const SOURCE_QUALITY_MAP: Record<string, SourceQuality> = {
  CouponDB: 'high',
  TechDeals: 'high',
  RetailCodes: 'medium',
  DealHunter: 'medium',
  CouponCollect: 'low',
  SpamForum: 'low',
  GenericSource: 'low',
};

function classifySourceQuality(sourceName: string): SourceQuality {
  return SOURCE_QUALITY_MAP[sourceName] ?? 'low';
}

function pickBestString(values: (string | null | undefined)[]): string {
  return values.find((v) => v && v.trim().length > 0) ?? '';
}

function pickBestNumber(
  values: (number | null)[],
  strategy: 'max' | 'min',
): number | null {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;
  return strategy === 'max' ? Math.max(...valid) : Math.min(...valid);
}

export function deduplicateCoupons(candidates: CouponCandidate[]): CouponAggregate[] {
  const groups = new Map<string, CouponCandidate[]>();

  for (const c of candidates) {
    const key = c.code.trim().toUpperCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }

  const result: CouponAggregate[] = [];

  for (const [code, group] of Array.from(groups.entries())) {
    const byRecency = [...group].sort(
      (a, b) => new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime(),
    );
    const newest = byRecency[0];

    const sources: CouponSource[] = byRecency.map((c) => ({
      name: c.sourceName,
      url: c.sourceUrl,
      quality: classifySourceQuality(c.sourceName),
      foundAt: c.foundAt,
    }));

    // Prefer highest discount value, lowest minimum order
    const discountValue = pickBestNumber(
      group.map((c: CouponCandidate) => c.discountValue),
      'max',
    );
    const minimumOrderValue = pickBestNumber(
      group.map((c: CouponCandidate) => c.minimumOrderValue),
      'min',
    );

    // Take latest known expiry date
    const expiries = group
      .map((c: CouponCandidate) => c.expiresAt)
      .filter(Boolean) as string[];
    const expiresAt = expiries.length > 0 ? expiries.sort().reverse()[0] : null;

    // Merge exclusions
    const exclusions = Array.from(new Set(group.flatMap((c: CouponCandidate) => c.exclusions)));

    result.push({
      code,
      title: pickBestString(group.map((c: CouponCandidate) => c.title)),
      description: pickBestString(group.map((c: CouponCandidate) => c.description)),
      discountType: newest.discountType,
      discountValue,
      minimumOrderValue,
      audienceType: newest.audienceType,
      exclusions,
      sources,
      foundAt: newest.foundAt,
      expiresAt,
      // Placeholders — filled by scorer
      status: 'unconfirmed',
      score: {
        sourceQuality: 0,
        recency: 0,
        sourceCount: 0,
        expiryStatus: 0,
        completeness: 0,
        spamPenalty: 0,
        total: 0,
        reasoning: '',
      },
    });
  }

  return result;
}
