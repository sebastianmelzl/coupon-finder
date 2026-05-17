import { ShopMetadata, ShopSystem } from '../types';
import { extractDomain, extractHostname } from '../url/normalizer';

const KNOWN_SHOPS: Record<string, string> = {
  'zalando.de': 'Zalando',
  'zalando.at': 'Zalando Österreich',
  'zalando.ch': 'Zalando Schweiz',
  'otto.de': 'OTTO',
  'amazon.de': 'Amazon DE',
  'amazon.com': 'Amazon',
  'amazon.co.uk': 'Amazon UK',
  'mediamarkt.de': 'MediaMarkt',
  'saturn.de': 'Saturn',
  'about-you.de': 'About You',
  'aboutyou.de': 'About You',
  'bonprix.de': 'Bonprix',
  'adidas.de': 'Adidas',
  'adidas.com': 'Adidas',
  'nike.com': 'Nike',
  'zara.com': 'Zara',
  'hm.com': 'H&M',
  'h-m.com': 'H&M',
  'mytheresa.com': 'Mytheresa',
  'farfetch.com': 'Farfetch',
  'asos.com': 'ASOS',
  'rewe.de': 'REWE',
  'dm.de': 'dm',
  'douglas.de': 'Douglas',
  'notino.de': 'Notino',
  'peek-cloppenburg.de': 'Peek & Cloppenburg',
  'c-a.com': 'C&A',
  'tchibo.de': 'Tchibo',
  'lidl.de': 'Lidl',
  'aldi.de': 'ALDI',
  'cyberport.de': 'Cyberport',
  'alternate.de': 'Alternate',
  'mindfactory.de': 'Mindfactory',
  'conrad.de': 'Conrad',
  'reichelt.de': 'Reichelt',
  'thalia.de': 'Thalia',
  'weltbild.de': 'Weltbild',
  'buecher.de': 'Bücher.de',
  'idealo.de': 'Idealo',
  'check24.de': 'CHECK24',
};

const SHOPIFY_PATTERNS = ['.myshopify.com', 'shopify.com'];
const SHOPWARE_PATTERNS = ['shopware', '/sw-'];
const WOOCOMMERCE_PATTERNS = ['/wp-json/wc/', '?wc-api='];
const MAGENTO_PATTERNS = ['/pub/static/', 'magento', '/checkout/cart/'];
const PRESTASHOP_PATTERNS = ['prestashop', '/index.php?controller='];

function detectShopSystem(hostname: string): ShopSystem {
  const h = hostname.toLowerCase();
  if (SHOPIFY_PATTERNS.some((p) => h.includes(p))) return 'shopify';
  if (SHOPWARE_PATTERNS.some((p) => h.includes(p))) return 'shopware';
  if (WOOCOMMERCE_PATTERNS.some((p) => h.includes(p))) return 'woocommerce';
  if (MAGENTO_PATTERNS.some((p) => h.includes(p))) return 'magento';
  if (PRESTASHOP_PATTERNS.some((p) => h.includes(p))) return 'prestashop';
  return 'unknown';
}

function inferShopName(domain: string): string {
  if (KNOWN_SHOPS[domain]) return KNOWN_SHOPS[domain];

  return domain
    .replace(/\.(de|com|at|ch|net|org|shop|store|eu|io)$/, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function detectShop(url: string): ShopMetadata {
  const domain = extractDomain(url);
  const hostname = extractHostname(url);

  return {
    url,
    domain,
    hostname,
    shopName: inferShopName(domain),
    shopSystem: detectShopSystem(hostname),
    detectedAt: new Date().toISOString(),
  };
}
