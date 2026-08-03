import './globals.css';
import type { Metadata } from 'next';
import { ThemeScript } from './components/theme-script';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'B\u00f6zer Gaming',
  description: 'Mini Oyun Platformu',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'B\u00f6zer Gaming',
    description: 'Mini Oyun Platformu',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
        <ThemeScript />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
