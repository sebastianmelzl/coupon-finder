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
  formatRelativeDate,
} from '@/lib/utils/formatting';

interface Props {
  coupon: CouponAggregate;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      )}
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Kopiert
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Kopieren
        </>
      )}
    </button>
  );
}

export default function CouponCard({ coupon }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isInactive = coupon.status === 'expired' || coupon.status === 'likely_invalid';

  return (
    <div
      className={clsx(
        'rounded-xl border bg-white transition-shadow hover:shadow-sm',
        isInactive ? 'border-slate-150 opacity-75' : 'border-slate-200',
      )}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Code display */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={clsx(
                  'font-mono text-lg font-bold tracking-wider',
                  isInactive ? 'text-slate-400 line-through' : 'text-slate-900',
                )}
              >
                {coupon.code}
              </span>
              {!isInactive && <CopyButton code={coupon.code} />}
            </div>
            <p className="mt-1 text-sm font-medium text-slate-700">{coupon.title}</p>
          </div>

          {/* Score + status */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <StatusBadge status={coupon.status} />
            <ScoreIndicator score={coupon.score.total} size="sm" />
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-500 leading-relaxed">{coupon.description}</p>

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {coupon.discountValue !== null && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {formatDiscountValue(coupon.discountType, coupon.discountValue)}
            </span>
          )}
          {coupon.discountType === 'free_shipping' && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Gratis-Versand
            </span>
          )}
          {coupon.minimumOrderValue !== null && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {formatMinimumOrder(coupon.minimumOrderValue)}
            </span>
          )}
          {coupon.audienceType !== 'unknown' && (
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs text-purple-700">
              {formatAudience(coupon.audienceType)}
            </span>
          )}
          {coupon.expiresAt && (
            <span
              className={clsx(
                'rounded-full px-2.5 py-1 text-xs',
                coupon.status === 'expired'
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-orange-50 text-orange-700',
              )}
            >
              {formatExpiryDate(coupon.expiresAt)}
            </span>
          )}
        </div>

        {/* Exclusions */}
        {coupon.exclusions.length > 0 && (
          <p className="mt-2 text-xs text-slate-400">
            Ausgeschlossen: {coupon.exclusions.join(', ')}
          </p>
        )}
      </div>

      {/* Expand toggle */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-between px-5 py-3 text-xs text-slate-500 hover:bg-slate-50 transition-colors rounded-b-xl"
        >
          <span>
            {coupon.sources.length} Quelle{coupon.sources.length !== 1 ? 'n' : ''} · Score{' '}
            {coupon.score.total}/100
          </span>
          <svg
            className={clsx(
              'h-4 w-4 text-slate-400 transition-transform duration-200',
              expanded && 'rotate-180',
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="px-5 pb-4 space-y-4">
            {/* Reasoning */}
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-600 mb-1">Begründung der Einstufung</p>
              <p className="text-xs text-slate-500 leading-relaxed">{coupon.score.reasoning}</p>
            </div>

            {/* Score breakdown */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Score-Aufschlüsselung</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {[
                  { label: 'Quellenqualität', val: coupon.score.sourceQuality, max: 25 },
                  { label: 'Aktualität', val: coupon.score.recency, max: 20 },
                  { label: 'Quellenanzahl', val: coupon.score.sourceCount, max: 20 },
                  { label: 'Ablaufstatus', val: coupon.score.expiryStatus, max: 20 },
                  { label: 'Vollständigkeit', val: coupon.score.completeness, max: 10 },
                  ...(coupon.score.spamPenalty < 0
                    ? [{ label: 'Spam-Abzug', val: coupon.score.spamPenalty, max: 0 }]
                    : []),
                ].map(({ label, val, max }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span
                      className={clsx(
                        'font-mono font-medium',
                        val < 0 ? 'text-red-500' : val === max ? 'text-green-600' : 'text-slate-600',
                      )}
                    >
                      {val > 0 ? '+' : ''}{val}/{max}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Quellen</p>
              <div className="space-y-2">
                {coupon.sources.map((src, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'rounded-full px-1.5 py-0.5 text-xs font-medium',
                          src.quality === 'high'
                            ? 'bg-green-50 text-green-700'
                            : src.quality === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {src.quality === 'high' ? 'Hoch' : src.quality === 'medium' ? 'Mittel' : 'Niedrig'}
                      </span>
                      <span className="text-slate-600 font-medium">{src.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{formatRelativeDate(src.foundAt)}</span>
                      {src.url !== '#' && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
