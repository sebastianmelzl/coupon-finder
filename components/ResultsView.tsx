'use client';

import { useState, useMemo } from 'react';
import { SearchResponse, FilterStatus, SortField, CouponAggregate } from '@/lib/types';
import ShopInfoCard from './ShopInfoCard';
import SummaryStats from './SummaryStats';
import BestDealCard from './BestDealCard';
import FilterSort from './FilterSort';
import CouponCard from './CouponCard';
import TransparencyPanel from './TransparencyPanel';
import EmptyState from './EmptyState';

interface Props {
  data: SearchResponse & {
    usedFallback?: boolean;
    sourceBreakdown?: Record<string, number>;
    searchDurationMs?: number;
  };
}

function sortCoupons(coupons: CouponAggregate[], sort: SortField): CouponAggregate[] {
  return [...coupons].sort((a, b) => {
    if (sort === 'score') return b.score.total - a.score.total;
    if (sort === 'recency')
      return new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime();
    if (sort === 'discount') {
      const va = a.discountValue ?? 0;
      const vb = b.discountValue ?? 0;
      return vb - va;
    }
    return 0;
  });
}

export default function ResultsView({ data }: Props) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortField>('score');

  const counts = useMemo<Record<FilterStatus, number>>(
    () => ({
      all: data.results.length,
      confirmed: data.summary.confirmed,
      unconfirmed: data.summary.unconfirmed,
      expired: data.summary.expired,
      likely_invalid: data.summary.likelyInvalid,
    }),
    [data],
  );

  const filtered = useMemo(() => {
    const base =
      filter === 'all' ? data.results : data.results.filter((c) => c.status === filter);
    return sortCoupons(base, sort);
  }, [data.results, filter, sort]);

  return (
    <div className="mt-6 space-y-4">
      <ShopInfoCard
        shop={data.shop}
        usedFallback={data.usedFallback}
        sourceBreakdown={data.sourceBreakdown}
        searchDurationMs={data.searchDurationMs}
      />
      <SummaryStats summary={data.summary} />

      {data.bestDeal && <BestDealCard coupon={data.bestDeal} />}

      {data.results.length > 0 ? (
        <>
          <div className="pt-2">
            <FilterSort
              activeFilter={filter}
              activeSort={sort}
              onFilterChange={setFilter}
              onSortChange={setSort}
              counts={counts}
            />
          </div>

          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((coupon) => (
                <CouponCard key={coupon.code} coupon={coupon} />
              ))
            ) : (
              <EmptyState filtered />
            )}
          </div>
        </>
      ) : (
        <EmptyState />
      )}

      <TransparencyPanel />
    </div>
  );
}
