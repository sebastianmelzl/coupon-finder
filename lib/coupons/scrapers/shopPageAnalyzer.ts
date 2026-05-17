import { CouponCandidate, DiscountType } from '../../types';
import { fetchHtml, stripHtml } from './fetchUtil';
import { extractCodesFromHtml } from './codeExtractor';

interface JsonLdOffer {
  '@type'?: string;
  name?: string;
  description?: string;
  price?: string | number;
  priceCurrency?: string;
  validFrom?: string;
  validThrough?: string;
  discount?: string | number;
  discountCurrency?: string;
  couponCode?: string;
  code?: string;
}

function extractJsonLdCoupons(
  html: string,
  sourceUrl: string,
): CouponCandidate[] {
  const now = new Date().toISOString();
  const results: CouponCandidate[] = [];

  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;

  while ((m = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const items: JsonLdOffer[] = Array.isArray(data)
        ? data
        : data['@graph']
          ? data['@graph']
          : [data];

      for (const item of items) {
        const code = item.couponCode ?? item.code;
        if (!code || typeof code !== 'string') continue;

        const normalizedCode = code.trim().toUpperCase();
        if (normalizedCode.length < 4 || normalizedCode.length > 20) continue;

        let discountType: DiscountType = 'unknown';
        let discountValue: number | null = null;

        if (item.discount) {
          const v = parseFloat(String(item.discount));
          if (!isNaN(v)) {
            discountValue = v;
            discountType =
              item.discountCurrency === 'EUR' ? 'fixed' : 'percentage';
          }
        }

        results.push({
          code: normalizedCode,
          title: item.name ?? `Gutscheincode: ${normalizedCode}`,
          description: item.description ?? '',
          discountType,
          discountValue,
          minimumOrderValue: null,
          audienceType: 'unknown',
          exclusions: [],
          sourceName: 'Shop-Website (JSON-LD)',
          sourceUrl,
          foundAt: now,
          expiresAt: item.validThrough ?? null,
          rawEvidence: `JSON-LD structured data: ${JSON.stringify(item).slice(0, 200)}`,
        });
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }

  return results;
}

// Looks for newsletter/popup banners that often contain hidden discount codes
function extractBannerCodes(
  html: string,
  sourceUrl: string,
): CouponCandidate[] {
  const now = new Date().toISOString();
  const results: CouponCandidate[] = [];

  // Newsletter popup pattern: "10% Rabatt" near a code
  const bannerPattern =
    /(?:newsletter|anmelden|sign.?up|popup|banner|modal)[\s\S]{0,500}?([A-Z][A-Z0-9_-]{3,18}[0-9])/gi;

  let m: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((m = bannerPattern.exec(html)) !== null) {
    const code = m[1].toUpperCase();
    if (seen.has(code)) continue;
    seen.add(code);

    const ctx = stripHtml(
      html.slice(Math.max(0, m.index - 100), m.index + 300),
    );

    results.push({
      code,
      title: `Newsletter/Banner Code — ${code}`,
      description: ctx.slice(0, 200).trim(),
      discountType: 'unknown',
      discountValue: null,
      minimumOrderValue: null,
      audienceType: 'new_customer',
      exclusions: [],
      sourceName: 'Shop-Website (Banner)',
      sourceUrl,
      foundAt: now,
      expiresAt: null,
      rawEvidence: ctx.slice(0, 200),
    });
  }

  return results;
}

export async function analyzeShopPage(shopUrl: string): Promise<CouponCandidate[]> {
  try {
    const html = await fetchHtml(shopUrl, 8000);

    const jsonLdCodes = extractJsonLdCoupons(html, shopUrl);
    const bannerCodes = extractBannerCodes(html, shopUrl);
    const genericCodes = extractCodesFromHtml(
      html,
      'Shop-Website',
      shopUrl,
    );

    // Dedupe by code before returning
    const seen = new Set<string>();
    const all = [...jsonLdCodes, ...bannerCodes, ...genericCodes];
    return all.filter((c) => {
      if (seen.has(c.code)) return false;
      seen.add(c.code);
      return true;
    });
  } catch {
    return [];
  }
}
