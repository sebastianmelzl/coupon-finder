import { DiscountType, AudienceType, ShopSystem, CouponStatus } from '../types';

export function formatDiscountValue(
  type: DiscountType,
  value: number | null,
): string {
  if (value === null) return '—';
  if (type === 'percentage') return `${value} %`;
  if (type === 'fixed') return `${value} €`;
  if (type === 'free_shipping') return 'Gratis-Versand';
  if (type === 'bogo') return 'Buy 1 Get 1';
  return `${value}`;
}

export function formatDiscountType(type: DiscountType): string {
  const map: Record<DiscountType, string> = {
    percentage: 'Prozentualer Rabatt',
    fixed: 'Festbetrag',
    free_shipping: 'Kostenloser Versand',
    bogo: 'Buy One Get One',
    unknown: 'Unbekannt',
  };
  return map[type];
}

export function formatAudience(type: AudienceType): string {
  const map: Record<AudienceType, string> = {
    new_customer: 'Neukunden',
    existing_customer: 'Bestandskunden',
    unknown: 'Alle',
  };
  return map[type];
}

export function formatShopSystem(system: ShopSystem): string {
  const map: Record<ShopSystem, string> = {
    shopify: 'Shopify',
    shopware: 'Shopware',
    woocommerce: 'WooCommerce',
    magento: 'Magento',
    prestashop: 'PrestaShop',
    unknown: 'Unbekannt',
  };
  return map[system];
}

export function formatRelativeDate(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Heute';
  if (days === 1) return 'Gestern';
  if (days < 7) return `vor ${days} Tagen`;
  if (days < 30) return `vor ${Math.floor(days / 7)} Woche(n)`;
  if (days < 365) return `vor ${Math.floor(days / 30)} Monat(en)`;
  return `vor ${Math.floor(days / 365)} Jahr(en)`;
}

export function formatExpiryDate(isoString: string | null): string {
  if (!isoString) return 'Kein Ablaufdatum';
  const date = new Date(isoString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return `Abgelaufen (${date.toLocaleDateString('de-DE')})`;
  if (days === 0) return 'Läuft heute ab';
  if (days === 1) return 'Läuft morgen ab';
  if (days <= 7) return `Läuft in ${days} Tagen ab`;
  return `Gültig bis ${date.toLocaleDateString('de-DE')}`;
}

export function formatStatusLabel(status: CouponStatus): string {
  const map: Record<CouponStatus, string> = {
    confirmed: 'Bestätigt',
    unconfirmed: 'Unbestätigt',
    expired: 'Abgelaufen',
    likely_invalid: 'Wahrsch. ungültig',
  };
  return map[status];
}

export function formatMinimumOrder(value: number | null): string {
  if (value === null) return 'Kein Mindestbestellwert';
  return `Ab ${value} € MBW`;
}
