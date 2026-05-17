export default function LoadingState() {
  return (
    <div className="mt-8 space-y-4">
      {/* Shop info skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Best deal skeleton */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5 animate-pulse">
        <div className="mb-3 h-3 w-24 rounded bg-blue-200" />
        <div className="h-8 w-32 rounded-lg bg-blue-200" />
        <div className="mt-3 h-3 w-48 rounded bg-blue-100" />
      </div>

      {/* Coupon cards skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-3 w-64 rounded bg-slate-100" />
            </div>
            <div className="h-8 w-28 rounded-lg bg-slate-200" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-20 rounded-full bg-slate-100" />
            <div className="h-5 w-20 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}

      <p className="text-center text-xs text-slate-400 pt-2">
        Öffentliche Quellen werden durchsucht…
      </p>
    </div>
  );
}
