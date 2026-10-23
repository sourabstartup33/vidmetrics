import type { Metadata } from 'next';
import { Libre_Franklin, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const franklin = Libre_Franklin({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-franklin',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VidMetrics: competitor briefs for YouTube',
  description:
    'Paste any YouTube channel. VidMetrics reads its latest uploads and writes a brief: what wins, when they post and where they are open.',
  keywords: ['YouTube analytics', 'competitor analysis', 'YouTube competitor research', 'video metrics'],
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
    <html lang="en" className={`${franklin.variable} ${serif.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
