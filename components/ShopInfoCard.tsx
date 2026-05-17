import { ShopMetadata } from '@/lib/types';
import { formatShopSystem, formatRelativeDate } from '@/lib/utils/formatting';

interface Props {
  shop: ShopMetadata;
  usedFallback?: boolean;
  sourceBreakdown?: Record<string, number>;
  searchDurationMs?: number;
}

export default function ShopInfoCard({ shop, usedFallback, sourceBreakdown, searchDurationMs }: Props) {
  const initials = shop.shopName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const sourceEntries = sourceBreakdown
    ? Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1])
    : [];

  const totalCandidates = sourceEntries.reduce((s, [, n]) => s + n, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-slate-900">{shop.shopName}</h2>
            {shop.shopSystem !== 'unknown' && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {formatShopSystem(shop.shopSystem)}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500">{shop.domain}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-slate-400">
            {formatRelativeDate(shop.detectedAt)}
            {searchDurationMs !== undefined && (
              <span className="ml-1 text-slate-300">· {(searchDurationMs / 1000).toFixed(1)}s</span>
            )}
          </p>
        </div>
      </div>

      {/* Source breakdown */}
      {sourceEntries.length > 0 && (
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
          <p className="text-xs font-medium text-slate-600 mb-2">
            Durchsuchte Quellen
            <span className="ml-1 font-normal text-slate-400">({totalCandidates} Treffer gesamt)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sourceEntries.map(([name, count]) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600"
              >
                {name}
                <span className="text-slate-400">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {usedFallback && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-xs text-amber-700">
            <span className="font-medium">Hinweis:</span> Keine shopspezifischen Codes gefunden. Die
            angezeigten Pattern-Codes basieren auf gängigen Mustern und haben niedrige Konfidenz.
          </p>
        </div>
      )}
    </div>
  );
}
