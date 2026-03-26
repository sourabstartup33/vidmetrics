import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VidMetrics — Competitor Intelligence',
  description:
    'Track competitors, surface viral trends, and make data-driven decisions. The ultimate YouTube analytics platform for enterprise content teams.',
  keywords: ['YouTube analytics', 'competitor tracking', 'video metrics', 'trending detection'],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
