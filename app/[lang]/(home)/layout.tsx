import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';

const homeOptions = {
  ...baseOptions,
  nav: { 
    ...baseOptions.nav,
    enableSearch: false 
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout 
           {...homeOptions}>{children}</HomeLayout>;
}
