import { CouponCandidate, DiscountType } from '../../types';
import { stripHtml } from './fetchUtil';

// Coupon codes: uppercase, contain digits, 4–20 chars
// e.g. ZALAN20, WELCOME10, SUMMER25, NEUKUNDE15, OTTO10
const CODE_PATTERN = /\b([A-Z][A-Z0-9_-]{3,18}[0-9]|[A-Z]{2,}[0-9]+[A-Z0-9_-]*)\b/g;

// Indicates code is nearby in context
const COUPON_CONTEXT = [
  'code', 'gutschein', 'rabatt', 'coupon', 'promo', 'voucher',
  'aktionscode', 'einlösen', 'sparen', 'spare', 'redeem', 'discount',
  'angebot', 'aktion', 'vorteil', 'deal',
];

// Known-bad patterns (not coupon codes)
const BLOCKLIST = new Set([
  'HTTP', 'HTTPS', 'HTML', 'JSON', 'CSS', 'API', 'URL', 'SEO',
  'RGB', 'FAQ', 'AGB', 'AGBs', 'CTA', 'PDF', 'PNG', 'JPG', 'SVG',
  'USA', 'EUR', 'USD', 'GBP', 'UVP', 'MPN', 'EAN', 'ISBN',
  'NULL', 'TRUE', 'FALSE', 'NaN', 'GOTO', 'POST', 'GET',
]);

const BLOCKLIST_PREFIXES = ['HTTP', 'HTTPS', 'WWW', 'CDN', 'IMG', 'SRC'];

function isBlocklisted(code: string): boolean {
  if (BLOCKLIST.has(code)) return true;
  if (BLOCKLIST_PREFIXES.some((p) => code.startsWith(p))) return true;
  if (/^[A-Z]{1,3}$/.test(code)) return true; // country codes etc.
  if (/^[0-9]+$/.test(code)) return true;
  return false;
}

function hasContextMatch(surrounding: string): boolean {
  const lower = surrounding.toLowerCase();
  return COUPON_CONTEXT.some((w) => lower.includes(w));
}

// Extract direct attribute-embedded codes from raw HTML
const ATTR_CODE_PATTERNS = [
  /data-code="([A-Z0-9_-]{4,20})"/gi,
  /data-coupon(?:-code)?="([A-Z0-9_-]{4,20})"/gi,
  /data-clipboard-text="([A-Z0-9_-]{4,20})"/gi,
  /data-copy(?:-value)?="([A-Z0-9_-]{4,20})"/gi,
  /data-promo(?:-code)?="([A-Z0-9_-]{4,20})"/gi,
  /data-voucher(?:-code)?="([A-Z0-9_-]{4,20})"/gi,
];

// JS variable patterns
const JS_CODE_PATTERNS = [
  /(?:promoCode|couponCode|discountCode|promotionCode|voucherCode|coupon)['":\s]+['"]([A-Z0-9_-]{4,20})['"]/gi,
  /"code"\s*:\s*"([A-Z0-9_-]{4,20})"/gi,
];

function extractDiscountFromContext(ctx: string): {
  type: DiscountType;
  value: number | null;
  minOrder: number | null;
} {
  let type: DiscountType = 'unknown';
  let value: number | null = null;
  let minOrder: number | null = null;

  const pctMatch = ctx.match(/(\d+)\s*%/);
  const euroMatch = ctx.match(/(\d+)\s*€/);

  if (pctMatch) {
    type = 'percentage';
    value = parseInt(pctMatch[1], 10);
  } else if (euroMatch) {
    type = 'fixed';
    value = parseInt(euroMatch[1], 10);
  } else if (/gratis[- ]versand|free[- ]ship|versandkostenfrei/i.test(ctx)) {
    type = 'free_shipping';
  }

  const minOrderMatch = ctx.match(/ab\s+(\d+)\s*€/i);
  if (minOrderMatch) minOrder = parseInt(minOrderMatch[1], 10);

  return { type, value, minOrder };
}

function extractExpiryFromContext(ctx: string): string | null {
  const dateMatch = ctx.match(
    /(?:bis|gültig bis|läuft ab|valid until|expires?)\s+(?:zum\s+)?(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/i,
  );
  if (!dateMatch) return null;

  let [, day, month, year] = dateMatch;
  if (year.length === 2) year = '20' + year;
  const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function extractCodesFromHtml(
  html: string,
  sourceName: string,
  sourceUrl: string,
): CouponCandidate[] {
  const candidates: CouponCandidate[] = [];
  const foundCodes = new Set<string>();
  const now = new Date().toISOString();

  // 1. Extract from data attributes (highest confidence)
  for (const pattern of ATTR_CODE_PATTERNS) {
    let m: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(html)) !== null) {
      const code = m[1].toUpperCase();
      if (isBlocklisted(code) || foundCodes.has(code)) continue;
      foundCodes.add(code);

      const start = Math.max(0, m.index - 200);
      const end = Math.min(html.length, m.index + 200);
      const rawSnippet = html.slice(start, end);
      const ctx = stripHtml(rawSnippet);
      const { type, value, minOrder } = extractDiscountFromContext(ctx);

      candidates.push({
        code,
        title: inferTitleFromContext(ctx, code),
        description: ctx.slice(0, 200).trim(),
        discountType: type,
        discountValue: value,
        minimumOrderValue: minOrder,
        audienceType: 'unknown',
        exclusions: [],
        sourceName,
        sourceUrl,
        foundAt: now,
        expiresAt: extractExpiryFromContext(ctx),
        rawEvidence: `data-attribute: ${rawSnippet.slice(0, 120)}`,
      });
    }
  }

  // 2. Extract from JS variable assignments
  for (const pattern of JS_CODE_PATTERNS) {
    let m: RegExpExecArray | null;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(html)) !== null) {
      const code = m[1].toUpperCase();
      if (isBlocklisted(code) || foundCodes.has(code)) continue;
      foundCodes.add(code);

      const ctx = html.slice(Math.max(0, m.index - 150), m.index + 150);
      const { type, value, minOrder } = extractDiscountFromContext(ctx);

      candidates.push({
        code,
        title: inferTitleFromContext(ctx, code),
        description: stripHtml(ctx).slice(0, 200).trim(),
        discountType: type,
        discountValue: value,
        minimumOrderValue: minOrder,
        audienceType: 'unknown',
        exclusions: [],
        sourceName,
        sourceUrl,
        foundAt: now,
        expiresAt: extractExpiryFromContext(ctx),
        rawEvidence: `JS variable: ${ctx.slice(0, 120)}`,
      });
    }
  }

  // 3. Extract from visible text (context-gated)
  const plainText = stripHtml(html);
  let m: RegExpExecArray | null;
  CODE_PATTERN.lastIndex = 0;

  while ((m = CODE_PATTERN.exec(plainText)) !== null) {
    const code = m[1].toUpperCase();
    if (isBlocklisted(code) || foundCodes.has(code)) continue;

    const surrounding = plainText.slice(
      Math.max(0, m.index - 120),
      Math.min(plainText.length, m.index + 120),
    );

    if (!hasContextMatch(surrounding)) continue;

    foundCodes.add(code);
    const { type, value, minOrder } = extractDiscountFromContext(surrounding);

    candidates.push({
      code,
      title: inferTitleFromContext(surrounding, code),
      description: surrounding.slice(0, 200).trim(),
      discountType: type,
      discountValue: value,
      minimumOrderValue: minOrder,
      audienceType: /neukunde|erstbestellung|new customer|first order/i.test(surrounding)
        ? 'new_customer'
        : 'unknown',
      exclusions: [],
      sourceName,
      sourceUrl,
      foundAt: now,
      expiresAt: extractExpiryFromContext(surrounding),
      rawEvidence: surrounding.slice(0, 200),
    });
  }

  return candidates;
}

function inferTitleFromContext(ctx: string, code: string): string {
  const pct = ctx.match(/(\d+)\s*%/);
  const euro = ctx.match(/(\d+)\s*€/);
  if (pct) return `${pct[1]}% Rabatt — ${code}`;
  if (euro) return `${euro[1]} € Rabatt — ${code}`;
  if (/versandkostenfrei|gratis[- ]versand/i.test(ctx)) return `Gratis-Versand — ${code}`;
  return `Gutscheincode: ${code}`;
}
