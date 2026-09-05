import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Etiket Oluşturucu',
  description: 'Baba Etiket Sistemi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
