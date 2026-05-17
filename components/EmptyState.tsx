interface Props {
  filtered?: boolean;
}

export default function EmptyState({ filtered = false }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <svg
          className="h-7 w-7 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-700">
        {filtered ? 'Keine Codes in dieser Kategorie' : 'Keine Gutscheincodes gefunden'}
      </p>
      <p className="mt-1 text-sm text-slate-400">
        {filtered
          ? 'Versuche einen anderen Filter.'
          : 'Für diesen Shop konnten keine öffentlichen Gutscheincodes ermittelt werden.'}
      </p>
    </div>
  );
}
