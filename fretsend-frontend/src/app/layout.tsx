import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FretSend — Envois France ↔ Cameroun',
  description: 'Plateforme de gestion et suivi de colis entre la France et le Cameroun',
  icons: { icon: '/images/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.1.2/dist/maplibre-gl.css" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
