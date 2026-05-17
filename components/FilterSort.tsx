'use client';

import clsx from 'clsx';
import { FilterStatus, SortField } from '@/lib/types';

interface Props {
  activeFilter: FilterStatus;
  activeSort: SortField;
  onFilterChange: (f: FilterStatus) => void;
  onSortChange: (s: SortField) => void;
  counts: Record<FilterStatus, number>;
}

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'confirmed', label: 'Bestätigt' },
  { value: 'unconfirmed', label: 'Unbestätigt' },
  { value: 'expired', label: 'Abgelaufen' },
  { value: 'likely_invalid', label: 'Wahrsch. ungültig' },
];

const SORTS: { value: SortField; label: string }[] = [
  { value: 'score', label: 'Höchster Score' },
  { value: 'recency', label: 'Neueste zuerst' },
  { value: 'discount', label: 'Höchster Rabatt' },
];

export default function FilterSort({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
  counts,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(({ value, label }) => {
          const count = counts[value];
          if (value !== 'all' && count === 0) return null;
          return (
            <button
              key={value}
              onClick={() => onFilterChange(value)}
              className={clsx(
                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                activeFilter === value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              {label}
              <span
                className={clsx(
                  'rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                  activeFilter === value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <label className="text-xs text-slate-500 whitespace-nowrap" htmlFor="sort-select">
          Sortieren:
        </label>
        <select
          id="sort-select"
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as SortField)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {SORTS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
