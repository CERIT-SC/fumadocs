import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { Item, Folder } from '@/components/sidebar';
import { Trigger } from '@/components/ai/search-ai';
import { twMerge as cn } from 'tailwind-merge';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { MessageCircle } from 'lucide-react';

const docsOptions = {
  ...baseOptions,
  sidebar: {
    ...baseOptions.sidebar,
    components: { Folder: Folder, Item: Item },
  },
};

export default async function Layout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: ReactNode;
}) {
  return (
    <DocsLayout {...docsOptions} tree={source.pageTree[(await params).lang]}>
      {children}
      <Trigger
        className={cn(
          buttonVariants({
            variant: 'secondary',
          }),
          'fixed bottom-4 right-4 z-10 gap-2 rounded-xl text-fd-secondary-foreground/80 shadow-lg backdrop-blur-lg md:bottom-8 md:right-8',
          'bg-fd-secondary', 'ring-1', 'ring-[#24a9c2]'
        )}
      >
        <MessageCircle className="size-4" />
        Ask GPT AI
      </Trigger>
    </DocsLayout>
  );
}