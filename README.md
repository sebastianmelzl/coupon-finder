# Coupon Finder

Ein produktionsnahes SaaS-Tool zum Recherchieren, Bewerten und Anzeigen öffentlich verfügbarer Gutscheincodes für Onlineshops.

---

## Features

- **URL-Eingabe**: Shop-URL eingeben, Domain wird automatisch normalisiert
- **Shop-Erkennung**: Shopname, Domain, mögliches Shopsystem (Shopify, Shopware, WooCommerce, …)
- **Coupon-Recherche**: Modulare Quellenarchitektur (aktuell: Mock-Daten, erweiterbar auf echte Quellen)
- **Deduplizierung**: Gleiche Codes aus mehreren Quellen werden zusammengeführt
- **Confidence Scoring**: Transparente 0–100 Punkte Bewertung mit Aufschlüsselung
- **Status**: Bestätigt / Unbestätigt / Abgelaufen / Wahrsch. ungültig
- **Filter & Sortierung**: Nach Status filtern, nach Score/Aktualität/Rabatt sortieren
- **Best Deal**: Hervorgehobener bester Code
- **Copy-Button**: Code mit einem Klick kopieren
- **Transparenz-Panel**: Erklärung der Scoring-Logik und Quellenherkunft

---

## Tech-Stack

| Layer | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Sprache | TypeScript (strict) |
| Styling | Tailwind CSS v3 |
| Validierung | Zod |
| Runtime | Node.js via Next.js Route Handlers |

---

## Setup

### Voraussetzungen

- Node.js ≥ 18
- npm oder pnpm

### Installation

```bash
cd coupon-finder
npm install
```

### Starten (Entwicklung)

```bash
npm run dev
```

App läuft auf: [http://localhost:3000](http://localhost:3000)

### Produktions-Build

```bash
npm run build
npm start
```

---

## Projektstruktur

```
coupon-finder/
├── app/
│   ├── globals.css         # Tailwind-Basis
│   ├── layout.tsx          # Root-Layout, Metadata
│   ├── page.tsx            # Haupt-Seite (Client Component)
│   └── api/search/
│       └── route.ts        # POST /api/search
├── components/
│   ├── SearchForm.tsx      # URL-Eingabeformular
│   ├── ResultsView.tsx     # Ergebnisbereich (Filter, Sort, Liste)
│   ├── ShopInfoCard.tsx    # Shop-Metadaten-Karte
│   ├── SummaryStats.tsx    # Statistik-Kacheln
│   ├── BestDealCard.tsx    # Hervorgehobener bester Deal
│   ├── CouponCard.tsx      # Einzelne Coupon-Karte (expandierbar)
│   ├── FilterSort.tsx      # Filter/Sortier-Steuerung
│   ├── StatusBadge.tsx     # Farbiger Status-Badge
│   ├── ScoreIndicator.tsx  # Score-Balken (0–100)
│   ├── TransparencyPanel.tsx # Aufklapp-Erklärung des Scorings
│   ├── EmptyState.tsx      # Leerer Zustand
│   └── LoadingState.tsx    # Lade-Skeleton
├── lib/
│   ├── types/index.ts      # Alle TypeScript-Interfaces
│   ├── url/normalizer.ts   # URL-Normalisierung
│   ├── shop/detector.ts    # Shop-Name & System-Erkennung
│   ├── coupons/
│   │   ├── sources.ts      # Quellenabfrage (Mock + Stub für Real)
│   │   └── deduplicator.ts # Deduplizierung & Aggregation
│   ├── scoring/scorer.ts   # Confidence-Scoring
│   └── utils/formatting.ts # Display-Formatierung
└── data/
    └── mock-coupons.ts     # Realistische Mock-Daten
```

---

## Beispiel API-Request

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.zalando.de"}'
```

### Response

```json
{
  "shop": {
    "url": "https://www.zalando.de",
    "domain": "zalando.de",
    "hostname": "www.zalando.de",
    "shopName": "Zalando",
    "shopSystem": "unknown",
    "detectedAt": "2026-05-17T10:00:00.000Z"
  },
  "summary": {
    "totalFound": 5,
    "confirmed": 1,
    "unconfirmed": 1,
    "expired": 2,
    "likelyInvalid": 1,
    "searchedAt": "2026-05-17T10:00:00.000Z"
  },
  "bestDeal": {
    "code": "ZALAN20",
    "status": "confirmed",
    "score": { "total": 84, "reasoning": "..." },
    ...
  },
  "results": [...]
}
```

---

## Score-Logik (0–100 Punkte)

| Faktor | Max | Beschreibung |
|---|---|---|
| Quellenqualität | 25 | Bewertung der Herkunftsquelle (high/medium/low) |
| Aktualität | 20 | Tage seit letztem Fund |
| Quellenanzahl | 20 | Unabhängige Quellen, die denselben Code gefunden haben |
| Ablaufstatus | 20 | Bekanntes Ablaufdatum in der Zukunft |
| Vollständigkeit | 10 | Vorhandensein von Rabattwert, Typ, Beschreibung |
| Spam-Penalty | −20 | Codes mit verdächtigen Mustern (AAAA1111, TEST…) |

### Status-Ableitung

| Score | Status |
|---|---|
| Abgelaufen (flag) | Abgelaufen |
| ≥ 80 | Bestätigt |
| ≥ 55 | Unbestätigt |
| < 55 | Wahrscheinlich ungültig |

---

## Grenzen des Systems

- **Keine echte Checkout-Prüfung**: Codes werden heuristisch bewertet, nicht technisch im Shop getestet.
- **Keine Garantie**: Ein Score von 100 bedeutet nicht, dass ein Code funktioniert.
- **Mock-Daten**: In der aktuellen Version werden simulierte Quelldaten verwendet.
- **Keine Echtzeit-Daten**: Keine Live-Verbindung zu echten Coupon-Aggregatoren implementiert.
- **Shopsystem-Erkennung**: Basiert nur auf URL-Mustern, nicht auf Seiteninhalt-Analyse.

---

## Compliance-Hinweise

- Alle angezeigten Informationen stammen aus öffentlich verfügbaren Quellen.
- Die Anwendung umgeht keine technischen Schutzmaßnahmen.
- Die Anwendung tätigt keine automatisierten Checkout-Anfragen.
- Keine Aussagen wie „garantiert gültig" oder „100 % funktionierend".
- Beim Anbinden echter Quellen: `robots.txt` und Terms of Service der Quellen prüfen.
- Rate Limiting für die `/api/search`-Route für Produktiveinsatz einplanen.

---

## Ideen für nächste Ausbaustufen

1. **Echte Quellen**: Integration öffentlicher Coupon-Aggregatoren (ToS prüfen).
2. **Rate Limiting**: `@upstash/ratelimit` oder `express-rate-limit` über Middleware.
3. **Caching**: Redis oder Vercel KV für gecachte Ergebnisse je Domain.
4. **Playwright-Prüfung**: Optionale technische Validierung im Checkout (klar getrennt, nur mit Authorization-Check).
5. **Historisierung**: Datenbank-Backend, um Codes über Zeit zu tracken.
6. **User-Reports**: Nutzer können Codes als „funktioniert" oder „funktioniert nicht" markieren.
7. **Telegram/E-Mail-Alert**: Benachrichtigung bei neuen Codes für gemerkte Shops.
8. **Browser-Extension**: Coupon-Vorschläge direkt beim Shop-Besuch.
