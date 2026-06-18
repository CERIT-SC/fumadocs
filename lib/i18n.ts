import { defineI18n } from 'fumadocs-core/i18n';
import { includeCzech } from './shared';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', ...(includeCzech ? ['cz'] : [])],
});