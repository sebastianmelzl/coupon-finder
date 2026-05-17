import { CouponCandidate } from '../../types';
import { fetchHtml } from './fetchUtil';
import { extractCodesFromHtml } from './codeExtractor';

interface SiteConfig {
  name: string;
  buildUrl: (slug: string) => string;
}

const SITES: SiteConfig[] = [
  {
    name: 'Gutscheinpony',
    buildUrl: (s) => `https://www.gutscheinpony.de/gutscheine/${s}/`,
  },
  {
    name: 'Sparwelt',
    buildUrl: (s) => `https://www.sparwelt.de/gutscheine/${s}.html`,
  },
  {
    name: 'Coupons.de',
    buildUrl: (s) => `https://www.coupons.de/gutscheine/${s}/`,
  },
  {
    name: 'Gutscheincode.de',
    buildUrl: (s) => `https://www.gutscheincode.de/gutscheincode/${s}/`,
  },
  {
    name: 'Mydealz',
    buildUrl: (s) =>
      `https://www.mydealz.de/search?q=${encodeURIComponent(s + ' gutschein')}`,
  },
  {
    name: 'Couponvario',
    buildUrl: (s) => `https://couponvario.de/${s}/`,
  },
];

function domainToSlug(domain: string): string {
  return domain
    .replace(/^www\./, '')
    .replace(/\.(de|com|at|ch|net|org|shop|store|eu)$/, '')
    .toLowerCase();
}

async function scrapeOneSite(
  site: SiteConfig,
  slug: string,
): Promise<CouponCandidate[]> {
  const url = site.buildUrl(slug);
  try {
    const html = await fetchHtml(url, 7000);
    const codes = extractCodesFromHtml(html, site.name, url);
    return codes;
  } catch {
    return [];
  }
}

export async function scrapeAllCouponSites(
  domain: string,
): Promise<CouponCandidate[]> {
  const slug = domainToSlug(domain);

  const results = await Promise.allSettled(
    SITES.map((site) => scrapeOneSite(site, slug)),
  );

  return results.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : [],
  );
}
