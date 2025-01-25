import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { Item, Folder } from '@/components/sidebar';
import { Trigger } from '@/components/ai/search-ai';
import { twMerge as cn } from 'tailwind-merge';
import { buttonVariants } from '@/components/button';
import { MessageCircle } from 'lucide-react';
import { auth } from "@/lib/auth";

const docsOptions = {
  ...baseOptions,
  sidebar: {
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
  const checkAuth = process.env.NEXT_PUBLIC_AUTHORITY_PROD !== undefined;
  const session = checkAuth ? await auth() : true;
  return (
    <DocsLayout {...docsOptions} tree={source.pageTree[(await params).lang as keyof typeof source.pageTree]}>
      {children}
      <Trigger
        session={!!session}
        className={cn(
          buttonVariants({
            variant: 'secondary',
          }),
          'fixed bottom-4 right-4 z-10 gap-2 rounded-xl text-fd-secondary-foreground/80 shadow-lg backdrop-blur-lg md:bottom-8 md:right-8',
          'bg-fd-secondary', 'ring-1', 'ring-[#24a9c2]'
        )}
      >
        <MessageCircle className="size-4" />
        { session ? "Ask GPT AI" : "Sign in to Ask GPT AI" }
      </Trigger>
    </DocsLayout>
  );
}
