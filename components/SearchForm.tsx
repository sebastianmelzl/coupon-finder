'use client';

import { useState, FormEvent } from 'react';
import clsx from 'clsx';
import { isValidUrl } from '@/lib/url/normalizer';

interface Props {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

const EXAMPLE_URLS = [
  'zalando.de',
  'otto.de',
  'mediamarkt.de',
  'amazon.de',
  'about-you.de',
];

export default function SearchForm({ onSearch, isLoading }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  function validate(url: string): string {
    if (!url.trim()) return 'Bitte gib eine Shop-URL ein.';
    if (!isValidUrl(url)) return 'Ungültige URL. Beispiel: https://www.zalando.de';
    return '';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    const err = validate(value);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onSearch(value);
  }

  function handleChange(val: string) {
    setValue(val);
    if (touched) setError(validate(val));
  }

  function handleExample(example: string) {
    setValue(example);
    setError('');
    setTouched(true);
    onSearch(example);
  }

  const hasError = touched && error;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        className={clsx(
          'flex overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow focus-within:shadow-md',
          hasError ? 'border-red-300' : 'border-slate-200 focus-within:border-slate-300',
        )}
      >
        <div className="flex flex-1 items-center gap-3 px-4">
          <svg
            className="h-5 w-5 flex-shrink-0 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
            />
          </svg>
          <input
            type="url"
            placeholder="https://www.beispielshop.de"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={isLoading}
            className="flex-1 bg-transparent py-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50"
            autoComplete="url"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={clsx(
            'flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700',
          )}
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Suche…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Codes suchen
            </>
          )}
        </button>
      </div>

      {hasError && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Beispiele:</span>
        {EXAMPLE_URLS.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => handleExample(ex)}
            disabled={isLoading}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  );
}
