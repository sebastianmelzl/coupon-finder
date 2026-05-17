import { useState } from 'react';

const SCORE_FACTORS = [
  { label: 'Quellenqualität', max: 25, desc: 'Hochwertige, vertrauenswürdige Quellen erhalten mehr Punkte als unbekannte Foren.' },
  { label: 'Aktualität', max: 20, desc: 'Kürzlich gefundene Codes erhalten mehr Punkte als alte Einträge.' },
  { label: 'Quellenanzahl', max: 20, desc: 'Wenn derselbe Code unabhängig in mehreren Quellen auftaucht, steigt das Vertrauen.' },
  { label: 'Ablaufstatus', max: 20, desc: 'Codes mit bekanntem, zukünftigem Ablaufdatum werden höher bewertet.' },
  { label: 'Vollständigkeit', max: 10, desc: 'Vorhandene Metadaten (Rabattwert, Typ, Beschreibung) erhöhen den Score.' },
  { label: 'Spam-Penalty', max: -20, desc: 'Codes mit verdächtigen Mustern (z. B. AAAA1111) erhalten einen Abzug.' },
];

export default function TransparencyPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Wie funktioniert die Einstufung?</p>
            <p className="text-xs text-slate-500">Transparenz über Score-Logik und Datenquellen</p>
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Score-Faktoren (0–100 Punkte)</h3>
            <div className="space-y-2">
              {SCORE_FACTORS.map(({ label, max, desc }) => (
                <div key={label} className="flex gap-3">
                  <div className="flex-shrink-0 w-28 flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${max < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                      {max > 0 ? `+${max}` : max} Pkt.
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Status-Definitionen</h3>
            <div className="space-y-2">
              {[
                { status: 'Bestätigt (≥ 80)', color: 'bg-green-100 text-green-700', desc: 'Mehrere hochwertige Quellen, neuere Funde, plausibles Ablaufdatum.' },
                { status: 'Unbestätigt (55–79)', color: 'bg-amber-100 text-amber-700', desc: 'Gefunden, aber nicht durch mehrere unabhängige Quellen bestätigt.' },
                { status: 'Wahrsch. ungültig (< 55)', color: 'bg-red-100 text-red-700', desc: 'Alter Eintrag, einzige niedrigwertige Quelle, oder verdächtiges Muster.' },
                { status: 'Abgelaufen', color: 'bg-slate-100 text-slate-600', desc: 'Bekanntes Ablaufdatum liegt in der Vergangenheit.' },
              ].map(({ status, color, desc }) => (
                <div key={status} className="flex gap-3 items-start">
                  <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{status}</span>
                  <p className="text-xs text-slate-500 pt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Wichtige Hinweise</p>
            <ul className="space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li>Alle Ergebnisse stammen aus öffentlich verfügbaren Quellen.</li>
              <li>Kein Score garantiert die tatsächliche Einlösbarkeit eines Codes.</li>
              <li>Die Gültigkeit hängt vom Shop, Warenkorb, Kundentyp und Aktionsbedingungen ab.</li>
              <li>Technische Prüfungen im Checkout werden von dieser Anwendung nicht durchgeführt.</li>
              <li>Dieses Tool macht niemals eine Aussage wie „100 % gültig" oder „garantiert funktionierend".</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
