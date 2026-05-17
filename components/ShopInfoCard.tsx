import { ShopMetadata } from '@/lib/types';
import { formatShopSystem, formatRelativeDate } from '@/lib/utils/formatting';

interface Props {
  shop: ShopMetadata;
  usedFallback?: boolean;
}

export default function ShopInfoCard({ shop, usedFallback }: Props) {
  const initials = shop.shopName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

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
          <p className="text-xs text-slate-400">Gesucht {formatRelativeDate(shop.detectedAt)}</p>
        </div>
      </div>

      {usedFallback && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-xs text-amber-700">
            <span className="font-medium">Hinweis:</span> Für diesen Shop wurden keine
            shopspezifischen Daten gefunden. Die angezeigten Codes sind generische Muster und
            beziehen sich nicht direkt auf diesen Shop.
          </p>
        </div>
      )}
    </div>
  );
}
