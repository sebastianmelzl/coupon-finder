'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { CouponAggregate } from '@/lib/types';
import StatusBadge from './StatusBadge';
import ScoreIndicator from './ScoreIndicator';
import {
  formatDiscountValue,
  formatAudience,
  formatExpiryDate,
  formatMinimumOrder,
} from '@/lib/utils/formatting';

interface Props {
  coupon: CouponAggregate;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150',
        copied
          ? 'bg-green-600 text-white'
          : 'bg-slate-900 text-white hover:bg-slate-700',
      )}
    >
      {copied ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Code kopiert
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Code kopieren
        </>
      )}
    </button>
  );
}

export default function BestDealCard({ coupon }: Props) {
  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
          Bester gefundener Deal
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-2xl font-bold tracking-wider text-slate-900">
              {coupon.code}
            </span>
            <StatusBadge status={coupon.status} />
          </div>
          <p className="mt-1 text-sm font-medium text-slate-700">{coupon.title}</p>
          <p className="mt-1 text-sm text-slate-500">{coupon.description}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {coupon.discountValue !== null && (
              <span className="font-semibold text-blue-700">
                {formatDiscountValue(coupon.discountType, coupon.discountValue)}
              </span>
            )}
            {coupon.minimumOrderValue !== null && (
              <span className="text-slate-500">
                {formatMinimumOrder(coupon.minimumOrderValue)}
              </span>
            )}
            {coupon.audienceType !== 'unknown' && (
              <span className="text-slate-500">
                · {formatAudience(coupon.audienceType)}
              </span>
            )}
            {coupon.expiresAt && (
              <span className="text-slate-500">
                · {formatExpiryDate(coupon.expiresAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <CopyButton code={coupon.code} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Score</span>
            <ScoreIndicator score={coupon.score.total} size="md" />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-blue-600/80 bg-blue-100/60 rounded-lg px-3 py-2 leading-relaxed">
        {coupon.score.reasoning}
      </p>
    </div>
  );
}
