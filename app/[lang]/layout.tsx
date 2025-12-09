import './global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { defineI18nUI } from 'fumadocs-ui/i18n';
import { i18n } from '@/lib/i18n';

const { provider } = defineI18nUI(i18n, {
  //const includeCzech = process.env.NEXT_PUBLIC_CZECH === 'true';
  translations: {
    en: {
      displayName: 'English',
    },
    cz: {
      displayName: 'Česky',
      toc: 'Obsah',
      search: 'Hledat',
      lastUpdate: 'Poslední změna',
      searchNoResult: 'Žádný výsledek',
      tocNoHeadings: 'Bez nadpisů',
      previousPage: 'Předchozí',
      nextPage: 'Následující',
      chooseLanguage: 'Jazyk'    
    },
  },
});

export default async function Layout({ 
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
           theme={{
             enabled: false,
           }}
           i18n={provider(lang)}
        >
           {children}
        </RootProvider>
      </body>
    </html>
  );
}
