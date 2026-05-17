export type CouponStatus = 'confirmed' | 'unconfirmed' | 'expired' | 'likely_invalid';

export type DiscountType = 'percentage' | 'fixed' | 'free_shipping' | 'bogo' | 'unknown';

export type AudienceType = 'new_customer' | 'existing_customer' | 'unknown';

export type ShopSystem =
  | 'shopify'
  | 'shopware'
  | 'woocommerce'
  | 'magento'
  | 'prestashop'
  | 'unknown';

export type SourceQuality = 'high' | 'medium' | 'low';

export interface ShopInput {
  url: string;
}

export interface ShopMetadata {
  url: string;
  domain: string;
  hostname: string;
  shopName: string;
  shopSystem: ShopSystem;
  detectedAt: string;
}

export interface CouponSource {
  name: string;
  url: string;
  quality: SourceQuality;
  foundAt: string;
}

export interface CouponCandidate {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number | null;
  minimumOrderValue: number | null;
  audienceType: AudienceType;
  exclusions: string[];
  sourceName: string;
  sourceUrl: string;
  foundAt: string;
  expiresAt: string | null;
  rawEvidence: string;
}

export interface CouponScoreBreakdown {
  sourceQuality: number;
  recency: number;
  sourceCount: number;
  expiryStatus: number;
  completeness: number;
  spamPenalty: number;
  total: number;
  reasoning: string;
}

export interface CouponAggregate {
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number | null;
  minimumOrderValue: number | null;
  audienceType: AudienceType;
  exclusions: string[];
  sources: CouponSource[];
  foundAt: string;
  expiresAt: string | null;
  status: CouponStatus;
  score: CouponScoreBreakdown;
}

export interface SearchSummary {
  totalFound: number;
  confirmed: number;
  unconfirmed: number;
  expired: number;
  likelyInvalid: number;
  searchedAt: string;
}

export interface SearchResponse {
  shop: ShopMetadata;
  summary: SearchSummary;
  bestDeal: CouponAggregate | null;
  results: CouponAggregate[];
}

export type SortField = 'score' | 'recency' | 'discount';
export type FilterStatus = 'all' | CouponStatus;
