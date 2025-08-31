import { defineI18n } from 'fumadocs-core/i18n';

const includeCzech = process.env.NEXT_PUBLIC_CZECH === 'true';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: includeCzech ? ['en', 'cz'] : ['en'],
});
