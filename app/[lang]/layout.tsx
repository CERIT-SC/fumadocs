import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import { I18nProvider } from 'fumadocs-ui/i18n';

export default async function Layout({ 
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  const { lang } = await params;
  const includeCzech = process.env.NEXT_PUBLIC_CZECH === 'true';
  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <I18nProvider
          locale={lang}
          locales={[
            {
              name: 'English',
              locale: 'en',
            },
            ...(includeCzech ? [
              {
                name: 'Česky',
                locale: 'cz',
              }
            ] : [])
          ]}
          translations={
            {
              cz: {
                toc: 'Obsah',
                search: 'Hledat',
                lastUpdate: 'Poslední změna',
                searchNoResult: 'Žádný výsledek',
                tocNoHeadings: 'Bez nadpisů',
                previousPage: 'Předchozí',
                nextPage: 'Následující',
                chooseLanguage: 'Jazyk',
              },
            }[lang]
          }
        >
        <RootProvider
           theme={{
             enabled: false,
           }}
        >
           {children}
        </RootProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
