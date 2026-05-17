import { SearchSummary } from '@/lib/types';

interface Props {
  summary: SearchSummary;
}

const stats = [
  { key: 'totalFound', label: 'Codes gesamt', color: 'text-slate-700' },
  { key: 'confirmed', label: 'Bestätigt', color: 'text-green-600' },
  { key: 'unconfirmed', label: 'Unbestätigt', color: 'text-amber-600' },
  { key: 'expired', label: 'Abgelaufen', color: 'text-slate-400' },
] as const;

export default function SummaryStats({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ key, label, color }) => (
        <div
          key={key}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center"
        >
          <p className={`text-2xl font-bold tabular-nums ${color}`}>{summary[key]}</p>
          <p className="mt-0.5 text-xs text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
