import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coupon Finder — Öffentliche Gutscheincodes mit Vertrauensbewertung',
  description:
    'Finde öffentlich verfügbare Gutscheincodes für jeden Onlineshop. Mit transparentem Confidence Score, Quellangabe und klarer Statuseinstufung.',
  keywords: ['Gutscheincode', 'Rabattcode', 'Coupon', 'Preisvorteil', 'Online Shopping'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
