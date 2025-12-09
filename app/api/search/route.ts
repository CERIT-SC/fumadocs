import { source } from '@/lib/source';
import { createI18nSearchAPI } from 'fumadocs-core/search/server';
import { i18n } from '@/lib/i18n';

export const { GET } = createI18nSearchAPI('advanced', {
  i18n,
  indexes:  async () => {
    const languages = source.getLanguages();
    const results = await Promise.all(
      languages.flatMap((entry) =>
        entry.pages.map(async (page) => {
          const { structuredData } = await page.data.load();
          return {
            title: page.data.title,
            description: page.data.description,
            structuredData: structuredData,
            id: page.url,
            url: page.url,
            locale: entry.language,
          };
        })
      )
    );
    return results.flat();
  }
});
