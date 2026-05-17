'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ResultsView from '@/components/ResultsView';
import LoadingState from '@/components/LoadingState';
import { SearchResponse } from '@/lib/types';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function HomePage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState<(SearchResponse & { usedFallback?: boolean }) | null>(null);

  async function handleSearch(url: string) {
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Unbekannter Fehler');
      }

      setResults(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-800">Coupon Finder</span>
          </div>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Beta
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-10">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Öffentliche Quellen · Transparente Bewertung
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Gutscheincodes mit Vertrauen
          </h1>
          <p className="mt-3 text-base text-slate-500 max-w-lg mx-auto">
            Gib die URL eines Onlineshops ein und erhalte eine bewertete Liste öffentlich
            verfügbarer Gutscheincodes — mit Quellangabe, Score und klarem Status.
          </p>
        </div>

        <SearchForm onSearch={handleSearch} isLoading={status === 'loading'} />

        {status === 'loading' && <LoadingState />}

        {status === 'error' && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-700">Fehler bei der Suche</p>
              <p className="mt-0.5 text-sm text-red-600">{errorMsg}</p>
            </div>
          </div>
        )}

        {status === 'success' && results && <ResultsView data={results} />}

        {status === 'idle' && (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: 'Transparente Bewertung',
                desc: 'Jeder Code erhält einen Confidence Score (0–100) mit nachvollziehbarer Begründung.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                ),
                title: 'Öffentliche Quellen',
                desc: 'Codes werden aus öffentlich zugänglichen Quellen aggregiert und dedupliziert.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                ),
                title: 'Filterbar & Sortierbar',
                desc: 'Nach Status filtern, nach Score sortieren, Codes mit einem Klick kopieren.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {icon}
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs text-slate-400">
            Coupon Finder zeigt ausschließlich öffentlich zugängliche Informationen. Keine Einlösbarkeit wird garantiert.
          </p>
        </div>
      </footer>
    </div>
  );
}
