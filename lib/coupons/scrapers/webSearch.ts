import { CouponCandidate } from '../../types';
import { fetchHtml, stripHtml } from './fetchUtil';
import { extractCodesFromHtml } from './codeExtractor';

// DuckDuckGo HTML endpoint — no API key required, public search
function buildDdgUrl(query: string): string {
  return `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=de-de`;
}

// Bing (fallback) — also has an accessible HTML view
function buildBingUrl(query: string): string {
  return `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=de-DE&cc=DE`;
}

// Extract result snippets from DuckDuckGo HTML
function parseDdgSnippets(html: string): string[] {
  const snippets: string[] = [];

  // DDG wraps results in divs with class "result__snippet" or "result__body"
  const snippetPattern =
    /<(?:div|span|a)[^>]+class="[^"]*(?:result__snippet|result__body|result__title|result_snippet)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span|a)>/gi;

  let m: RegExpExecArray | null;
  while ((m = snippetPattern.exec(html)) !== null) {
    const text = stripHtml(m[1]).trim();
    if (text.length > 10) snippets.push(text);
  }

  // Fallback: extract all text from result containers
  if (snippets.length === 0) {
    const fallback = stripHtml(html);
    snippets.push(fallback.slice(0, 5000));
  }

  return snippets;
}

function parseBingSnippets(html: string): string[] {
  const snippets: string[] = [];
  const pattern = /<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(html)) !== null) {
    snippets.push(stripHtml(m[1]));
  }
  if (snippets.length === 0) {
    snippets.push(stripHtml(html).slice(0, 5000));
  }
  return snippets;
}

async function searchEngine(
  query: string,
  url: string,
  snippetParser: (html: string) => string[],
  sourceName: string,
): Promise<CouponCandidate[]> {
  try {
    const html = await fetchHtml(url, 8000);
    const snippets = snippetParser(html);
    const combinedText = snippets.join('\n');

    // Build a minimal fake-html to reuse the extractor
    const fakeHtml = `<div>${combinedText}</div>`;
    return extractCodesFromHtml(fakeHtml, sourceName, url);
  } catch {
    return [];
  }
}

export async function searchWebForCoupons(
  domain: string,
  shopName: string,
): Promise<CouponCandidate[]> {
  const year = new Date().getFullYear();

  const queries = [
    `"${domain}" gutscheincode ${year}`,
    `${shopName} gutschein code einlösen ${year}`,
    `"${domain}" promo code coupon`,
  ];

  const searches = [
    // DuckDuckGo
    ...queries.slice(0, 2).map((q) =>
      searchEngine(q, buildDdgUrl(q), parseDdgSnippets, 'DuckDuckGo-Suche'),
    ),
    // Bing for the third query
    searchEngine(queries[2], buildBingUrl(queries[2]), parseBingSnippets, 'Web-Suche'),
  ];

  const results = await Promise.allSettled(searches);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
