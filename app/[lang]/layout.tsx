import { i18nUI } from '@/lib/layout.shared';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { SessionProvider } from 'next-auth/react';
import './global.css';
import { Inter } from 'next/font/google';

import { baseUrl, createMetadata } from '@/lib/metadata';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata = createMetadata({
  title: {
    template: '%s',
    default: 'e-INFRA CZ',
  },
  description: 'e-INFRA CZ documentation framework.',
  metadataBase: baseUrl,
});

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const lang = (await params).lang;

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <SessionProvider>
          <RootProvider i18n={i18nUI.provider(lang)} theme={{ enableSystem: false, enabled: false }}>
            {children}
          </RootProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
