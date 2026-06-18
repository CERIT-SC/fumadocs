import { i18nUI } from '@/lib/layout.shared';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { SessionProvider } from 'next-auth/react';
import './global.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
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
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <SessionProvider>
          <RootProvider i18n={i18nUI.provider(lang)} theme={{ enableSystem: false }}>
            {children}
          </RootProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
