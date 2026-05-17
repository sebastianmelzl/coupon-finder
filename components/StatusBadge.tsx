import clsx from 'clsx';
import { CouponStatus } from '@/lib/types';
import { formatStatusLabel } from '@/lib/utils/formatting';

const CONFIG: Record<
  CouponStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  confirmed: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  unconfirmed: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  expired: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  likely_invalid: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-400',
  },
};

interface Props {
  status: CouponStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const c = CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        c.bg,
        c.text,
        c.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full flex-shrink-0', c.dot)} />
      {formatStatusLabel(status)}
    </span>
  );
}
