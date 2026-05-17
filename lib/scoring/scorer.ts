import { CouponAggregate, CouponStatus, CouponScoreBreakdown, SourceQuality } from '../types';

// Patterns that strongly suggest spam or test codes
const SPAM_PATTERNS = [
  /^[A-Z]{4}\d{4}$/,
  /^(TEST|DEMO|FAKE|XXXX|SAMPLE|EXAMPLE)/i,
  /^(ABC|XYZ|FOO|BAR|BLAH)/i,
  /^(.)\1{5,}$/, // e.g. AAAAAAA
];

function isSpamCode(code: string): boolean {
  return SPAM_PATTERNS.some((p) => p.test(code));
}

function scoreSourceQuality(sources: CouponAggregate['sources']): number {
  const weights: Record<SourceQuality, number> = { high: 25, medium: 15, low: 5 };
  return sources.reduce((best, s) => Math.max(best, weights[s.quality] ?? 0), 0);
}

function scoreRecency(foundAt: string): number {
  const days = (Date.now() - new Date(foundAt).getTime()) / 86400000;
  if (days <= 3) return 20;
  if (days <= 7) return 16;
  if (days <= 14) return 12;
  if (days <= 30) return 8;
  if (days <= 60) return 4;
  return 0;
}

function scoreSourceCount(count: number): number {
  if (count >= 3) return 20;
  if (count === 2) return 13;
  return 5;
}

function scoreExpiry(expiresAt: string | null): { points: number; isExpired: boolean } {
  if (!expiresAt) return { points: 5, isExpired: false };

  const days = (new Date(expiresAt).getTime() - Date.now()) / 86400000;
  if (days < 0) return { points: 0, isExpired: true };
  if (days <= 3) return { points: 8, isExpired: false };
  if (days <= 14) return { points: 15, isExpired: false };
  return { points: 20, isExpired: false };
}

function scoreCompleteness(c: CouponAggregate): number {
  let pts = 0;
  if (c.discountValue !== null) pts += 5;
  if (c.discountType !== 'unknown') pts += 3;
  if (c.description.length > 20) pts += 2;
  return pts;
}

function deriveStatus(total: number, isExpired: boolean): CouponStatus {
  if (isExpired) return 'expired';
  if (total >= 80) return 'confirmed';
  if (total >= 55) return 'unconfirmed';
  return 'likely_invalid';
}

function buildReasoning(
  sourceCount: number,
  bestQuality: SourceQuality,
  daysAgoFound: number,
  isExpired: boolean,
  expiresAt: string | null,
  isSpam: boolean,
): string {
  const parts: string[] = [];

  parts.push(
    sourceCount > 1
      ? `Code in ${sourceCount} unabhängigen Quellen gefunden`
      : 'Code in 1 Quelle gefunden',
  );

  if (bestQuality === 'high') parts.push('darunter mindestens eine hochwertige Quelle');
  else if (bestQuality === 'medium') parts.push('Quellen mittlerer Qualität');
  else parts.push('nur niedrig eingestufte Quellen');

  const daysRounded = Math.round(daysAgoFound);
  parts.push(
    daysRounded <= 1
      ? 'zuletzt heute gefunden'
      : `zuletzt gefunden vor ${daysRounded} Tag(en)`,
  );

  if (isExpired) {
    parts.push('Ablaufdatum überschritten — Code höchstwahrscheinlich ungültig');
  } else if (!expiresAt) {
    parts.push('kein Ablaufdatum bekannt');
  } else {
    const daysLeft = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / 86400000,
    );
    parts.push(`Ablaufdatum noch ${daysLeft} Tag(e) in der Zukunft`);
  }

  if (isSpam) parts.push('Code entspricht einem verdächtigen oder generischen Muster');

  return parts.join(', ') + '.';
}

export function scoreCoupon(coupon: CouponAggregate): CouponAggregate {
  const spam = isSpamCode(coupon.code);
  const sq = scoreSourceQuality(coupon.sources);
  const rec = scoreRecency(coupon.foundAt);
  const sc = scoreSourceCount(coupon.sources.length);
  const { points: exp, isExpired } = scoreExpiry(coupon.expiresAt);
  const comp = scoreCompleteness(coupon);
  const spamPenalty = spam ? -20 : 0;

  const total = Math.max(0, Math.min(100, sq + rec + sc + exp + comp + spamPenalty));

  const bestQuality = coupon.sources.reduce<SourceQuality>(
    (best, s) => {
      const order: SourceQuality[] = ['high', 'medium', 'low'];
      return order.indexOf(s.quality) < order.indexOf(best) ? s.quality : best;
    },
    'low',
  );

  const daysAgoFound =
    (Date.now() - new Date(coupon.foundAt).getTime()) / 86400000;

  const breakdown: CouponScoreBreakdown = {
    sourceQuality: sq,
    recency: rec,
    sourceCount: sc,
    expiryStatus: exp,
    completeness: comp,
    spamPenalty,
    total,
    reasoning: buildReasoning(
      coupon.sources.length,
      bestQuality,
      daysAgoFound,
      isExpired,
      coupon.expiresAt,
      spam,
    ),
  };

  return {
    ...coupon,
    status: deriveStatus(total, isExpired),
    score: breakdown,
  };
}

export function scoreAndRankAll(coupons: CouponAggregate[]): CouponAggregate[] {
  return coupons.map(scoreCoupon).sort((a, b) => b.score.total - a.score.total);
}
