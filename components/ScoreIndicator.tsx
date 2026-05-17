import clsx from 'clsx';

interface Props {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function colorForScore(score: number) {
  if (score >= 75) return { bar: 'bg-green-500', text: 'text-green-700', track: 'bg-green-100' };
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-700', track: 'bg-amber-100' };
  return { bar: 'bg-red-400', text: 'text-red-700', track: 'bg-red-100' };
}

export default function ScoreIndicator({ score, showLabel = true, size = 'md' }: Props) {
  const { bar, text, track } = colorForScore(score);
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className={clsx('flex items-center gap-2', size === 'sm' ? 'min-w-0' : 'min-w-[120px]')}>
      {showLabel && (
        <span className={clsx('font-semibold tabular-nums flex-shrink-0', text, size === 'sm' ? 'text-xs w-7' : 'text-sm w-8')}>
          {clamped}
        </span>
      )}
      <div className={clsx('rounded-full overflow-hidden flex-1', track, size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500', bar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
