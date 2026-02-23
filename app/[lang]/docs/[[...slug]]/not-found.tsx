"use client";

import { usePathname } from "next/navigation";
import {
  DocsPage,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';

const translations = {
  en: {
    title: 'Page Not Found',
    description: "The documentation page you're looking for doesn't exist or has been moved.",
  },
  cz: {
    title: 'Stránka nenalezena',
    description: 'Dokumentační stránka, kterou hledáte, neexistuje nebo byla přesunuta.',
  },
};

type Lang = keyof typeof translations;

export default function NotFound() {
  const pathname = usePathname();

  const lang = pathname.split('/')[1] as Lang;
  const t = translations[lang] || translations.en; 
  
  return (
    <DocsPage>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-12">

        <div className="relative mb-8">
          <div className="text-9xl font-black text-transparent bg-clip-text bg-linear-to-br from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 opacity-90">
            404
          </div>
        </div>

        <DocsTitle className="text-3xl mb-4">{t.title}</DocsTitle>

        <DocsDescription className="max-w-lg mb-8 text-lg text-muted-foreground">
          {t.description}
        </DocsDescription>
      </div>
    </DocsPage>
  );
}
