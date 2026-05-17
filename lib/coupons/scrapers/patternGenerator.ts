import { CouponCandidate } from '../../types';

const SEASONS: Record<number, string> = {
  0: 'WINTER', 1: 'WINTER', 2: 'FRÜHLING',
  3: 'FRÜHLING', 4: 'FRÜHLING', 5: 'SOMMER',
  6: 'SOMMER', 7: 'SOMMER', 8: 'HERBST',
  9: 'HERBST', 10: 'HERBST', 11: 'WINTER',
};

const MONTH_NAMES: Record<number, string> = {
  0: 'JAN', 1: 'FEB', 2: 'MÄR', 3: 'APR', 4: 'MAI', 5: 'JUN',
  6: 'JUL', 7: 'AUG', 8: 'SEP', 9: 'OKT', 10: 'NOV', 11: 'DEZ',
};

const UNIVERSAL_PATTERNS = [
  'WELCOME10', 'WELCOME15', 'WELCOME20',
  'NEUKUNDE10', 'NEUKUNDE15', 'NEUKUNDE20',
  'NEWSLETTER10', 'NEWSLETTER15',
  'SAVE10', 'SAVE15', 'SAVE20',
  'FIRST10', 'FIRST15',
  'EXTRA10', 'EXTRA15',
];

const DISCOUNT_VALUES: Record<string, number> = {
  '10': 10, '15': 15, '20': 20, '25': 25,
};

function cleanShopName(domain: string): string {
  return domain
    .replace(/^www\./, '')
    .replace(/\.(de|com|at|ch|net|org|shop|store|eu)$/, '')
    .replace(/[-_.]/g, '')
    .toUpperCase()
    .slice(0, 8); // cap at 8 chars to keep code length reasonable
}

function now(): string {
  return new Date().toISOString();
}

export function generatePatternCandidates(
  domain: string,
  shopName: string,
): CouponCandidate[] {
  const candidates: CouponCandidate[] = [];
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const shortYear = String(year).slice(-2);
  const season = SEASONS[month];
  const monthName = MONTH_NAMES[month];
  const slug = cleanShopName(domain);
  const shopSlug = shopName.replace(/\s/g, '').toUpperCase().slice(0, 8);

  const makeCandidate = (
    code: string,
    pct: number | null,
    desc: string,
  ): CouponCandidate => ({
    code,
    title: pct ? `${pct}% Rabatt — ${code}` : `Gutscheincode: ${code}`,
    description: desc,
    discountType: pct ? 'percentage' : 'unknown',
    discountValue: pct,
    minimumOrderValue: null,
    audienceType: code.includes('NEU') || code.includes('WELCOME') || code.includes('FIRST') || code.includes('NEWSLETTER')
      ? 'new_customer'
      : 'unknown',
    exclusions: [],
    sourceName: 'Muster-Analyse',
    sourceUrl: '#',
    foundAt: now(),
    expiresAt: null,
    rawEvidence: 'Generiert auf Basis häufig verwendeter Gutschein-Code-Muster für diesen Shop-Typ.',
  });

  // Shop-name based patterns
  for (const [suffix, val] of Object.entries(DISCOUNT_VALUES)) {
    if (slug) {
      candidates.push(makeCandidate(`${slug}${suffix}`, val, `Häufiges Muster: Shopname + Rabattwert.`));
      candidates.push(makeCandidate(`${shopSlug}${suffix}`, val, `Häufiges Muster: Shopname + Rabattwert.`));
    }
  }

  // Seasonal patterns
  candidates.push(
    makeCandidate(`${season}${shortYear}`, null, `Saisonaler Code für ${season} ${year}.`),
    makeCandidate(`${season}20`, 20, `Typischer saisonaler Rabattcode.`),
    makeCandidate(`${monthName}${shortYear}`, null, `Monatlicher Aktionscode.`),
    makeCandidate(`${monthName}20`, 20, `Monatlicher Aktionscode mit Rabatt.`),
  );

  // Universal welcome/new-customer patterns
  for (const p of UNIVERSAL_PATTERNS) {
    const m = p.match(/\d+$/);
    const pct = m ? parseInt(m[0], 10) : null;
    candidates.push(makeCandidate(p, pct, 'Universell verbreitetes Gutschein-Muster.'));
  }

  // Dedupe
  const seen = new Set<string>();
  return candidates.filter((c) => {
    if (seen.has(c.code)) return false;
    seen.add(c.code);
    return true;
  });
}
