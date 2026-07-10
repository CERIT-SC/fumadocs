import { source } from '@/lib/source';
import { DocsLayout, DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { MessageCircleIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import './docs.css'

export default async function Layout({ params, children }: LayoutProps<'/[lang]/docs'>) {
  const { lang } = await params;

  const docsLayoutOptions: DocsLayoutProps = {
    tree: source.getPageTree(lang),
    sidebar: {
      defaultOpenLevel: 1,
      collapsible: false,
      style: {
        background: "transparent"
      }
    },
    themeSwitch: { enabled: false }
  }

  return (
    <DocsLayout {...baseOptions} {...docsLayoutOptions}>
      <AISearch>
        <AISearchPanel />
        <AISearchTrigger
          position="float"
          className={cn(
            buttonVariants({
              variant: 'secondary',
              className: 'text-fd-muted-foreground rounded-2xl',
            }),
          )}
        >
          <MessageCircleIcon className="size-4.5" />
          Ask AI
        </AISearchTrigger>
      </AISearch>


      {children}
    </DocsLayout>
  );
}
