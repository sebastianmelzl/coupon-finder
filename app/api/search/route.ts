import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeUrl } from '@/lib/url/normalizer';
import { detectShop } from '@/lib/shop/detector';
import { fetchCoupons } from '@/lib/coupons/sources';
import { deduplicateCoupons } from '@/lib/coupons/deduplicator';
import { scoreAndRankAll } from '@/lib/scoring/scorer';
import { SearchResponse, SearchSummary } from '@/lib/types';

const RequestSchema = z.object({
  url: z.string().min(1, 'URL ist erforderlich').max(500, 'URL zu lang'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Ungültiger Request-Body.' }, { status: 400 });
    }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Anfrage.', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(parsed.data.url);
    } catch {
      return NextResponse.json(
        { error: 'Ungültige URL. Bitte gib eine vollständige Shop-URL ein, z. B. https://www.beispielshop.de' },
        { status: 400 },
      );
    }

    const shop = detectShop(normalizedUrl);
    const { candidates, sourceBreakdown, usedFallback, durationMs } =
      await fetchCoupons(shop.domain, shop.url, shop.shopName);

    const deduplicated = deduplicateCoupons(candidates);
    const scored = scoreAndRankAll(deduplicated);

    const summary: SearchSummary = {
      totalFound: scored.length,
      confirmed: scored.filter((c) => c.status === 'confirmed').length,
      unconfirmed: scored.filter((c) => c.status === 'unconfirmed').length,
      expired: scored.filter((c) => c.status === 'expired').length,
      likelyInvalid: scored.filter((c) => c.status === 'likely_invalid').length,
      searchedAt: new Date().toISOString(),
    };

    const bestDeal =
      scored.find((c) => c.status === 'confirmed' || c.status === 'unconfirmed') ?? null;

    const response: SearchResponse & {
      usedFallback: boolean;
      sourceBreakdown: Record<string, number>;
      searchDurationMs: number;
    } = {
      shop,
      summary,
      bestDeal,
      results: scored,
      usedFallback,
      sourceBreakdown,
      searchDurationMs: durationMs,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[/api/search] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler. Bitte versuche es später erneut.' },
      { status: 500 },
    );
  }
}
