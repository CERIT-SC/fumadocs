import { i18n } from '@/lib/i18n';
import { defineI18nUI } from 'fumadocs-ui/i18n';

import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, includeCzech, logo } from './shared';

export const i18nUI = defineI18nUI(i18n, {
  en: {
    displayName: 'English',
  },
  ...(includeCzech && {
    cz: {
      displayName: 'Čeština',
    },
  }),
});

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: (<><img src={logo} alt="Logo" className="w-11" />{appName}</>),
      url: "https://docs.e-infra.cz/",
    },
    themeSwitch: {
      enabled: false,
    },
  };
}
